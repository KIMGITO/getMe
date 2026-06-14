<?php

namespace App\Services;

use App\Enums\OrderEventActions;
use App\Enums\OrderStatus;
use App\Events\OrderEvent;
use App\Models\Order;
use App\Models\Rider;
use App\Services\GeoService;
use App\Services\TransportFeeCalculator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class AutoRiderSelectionService
{
    private GeoService $geoService;

    private TransportFeeCalculator $feeCalculator;

    public function __construct(
        GeoService $geoService,
        TransportFeeCalculator $feeCalculator
    ) {
        $this->geoService = $geoService;
        $this->feeCalculator = $feeCalculator;
    }

    /**
     * Find and select the best rider automatically
     */
    public function selectBestRider(Order $order, ?array $excludedRiders = null): ?array
    {
        Log::info("Selecting best rider for order {$order->id}");
        $market = $order->marketLocation;
        $delivery = $order->deliveryLocation;

        if (! $market || ! $delivery) {
            Log::error("Cannot select rider for order {$order->id}: missing locations");
            return null;
        }

        // Notify client we're searching
        OrderEvent::dispatch(
            OrderEventActions::ACTION_RIDER_SEARCHING,
            $order,
            ['message' => 'Searching for available riders...']
        );

        // Find nearby available riders with increasing radius
        $riders = [];
        $radius = 1;
        $maxRadius = 16;

        while (empty($riders) && $radius <= $maxRadius) {
            $riders = $this->geoService->findNearbyRidersFiltered(
                $market->lat,
                $market->lng,
                $radius,
                10
            );

            // Filter out rejected riders
            if ($excludedRiders && ! empty($riders)) {
                $riders = array_filter($riders, function ($rider) use ($excludedRiders) {
                    return ! in_array($rider['rider_id'], $excludedRiders);
                });
                $riders = array_values($riders); // Re-index
            }

            $radius++;
        }

        if (empty($riders)) {
            // No riders found
            Log::warning("No riders found for order {$order->id} in radius {$radius}km");
            OrderEvent::dispatch(
                OrderEventActions::ACTION_NO_RIDERS_AVAILABLE,
                $order,
                [
                    'message' => 'No riders available in your area. Please try again later.',
                    'searched_radius_km' => $maxRadius,
                ]
            );

            return null;
        }

        // Select the nearest rider (first in the list)
        $selectedRider = $riders[0];

        // Calculate delivery details
        $itemsCount = $order->items()->count();
        $dropOffDistance = $this->geoService->calculateDistance(
            "Market.{$market->id}",
            "Delivery.{$delivery->id}"
        );

        Log::warning('Dropoff distance: ' . $dropOffDistance);

        $feeResult = $this->feeCalculator
            ->reset()
            ->setDistance($dropOffDistance)
            ->setItemCount($itemsCount)
            ->calculate();

        // Calculate rider distance to market
        $riderDistance = $selectedRider['distance_km'];

        return [
            'rider' => $selectedRider,
            'rider_id' => $selectedRider['rider_id'],
            'rider_name' => $selectedRider['rider_name'] ?? 'Rider',
            'distance_to_market' => $riderDistance,
            'dropoff_distance' => $dropOffDistance,
            'total_distance' => $riderDistance + $dropOffDistance,
            'delivery_fee' => $feeResult['customer_pays'],
            'rider_payout' => $feeResult['breakdown']['rider_payout'],
            'estimated_arrival' => ceil(($riderDistance / 30) * 60), // minutes
            'items_count' => $itemsCount,
        ];
    }

    /**
     * Auto-select and assign rider to order
     */
    public function autoSelectAndAssign(Order $order, ?array $excludedRiders = null): bool
    {
        $order->load(['marketLocation', 'deliveryLocation', 'items']);
        try {
            DB::beginTransaction();

            // Find best rider
            $selection = $this->selectBestRider($order, $excludedRiders);

            if (! $selection) {
                DB::commit();
                Log::error("No rider selected for order {$order->id}");
                return false;
            }

            // Assign rider to order
            $order->update([
                'rider_id' => $selection['rider_id'],
                'order_status' => OrderStatus::BID_SELECTED, // New status

            ]);

            Log::info('Rider selected for order', [
                'order_id' => $order->id,
                'rider_id' => $selection['rider_id'],
            ]);

            // Temporarily mark rider as busy (but not on delivery yet)
            $rider = Rider::where('user_id', $selection['rider_id'])->first();
            if ($rider) {
                $rider->setNotIdle();
            }

            $market = $order->marketLocation->id;
            $delivery = $order->deliveryLocation->id;

            DB::commit();

            // Send notification to client about selected rider
            OrderEvent::dispatch(
                OrderEventActions::ACTION_RIDER_SELECTED,
                $order,
                [
                    'rider_id' => $selection['rider_id'],
                    'rider_name' => $selection['rider_name'],
                    'distance_km' => round($selection['distance_to_market'], 1),
                    'estimated_arrival_minutes' => $selection['estimated_arrival'],
                    'delivery_fee' => $selection['delivery_fee'],
                    'total_distance_km' => round($selection['total_distance'], 1),
                    'confirmation_timeout' => 30, // seconds to confirm
                ]
            );

            // Send notification to selected rider
            OrderEvent::dispatch(
                OrderEventActions::ACTION_RIDER_SELECTED,
                $order,
                [
                    'order_id' => $order->id,
                    'pickup_location' => $market,
                    'delivery_location' => $delivery,
                    'estimated_earning' => $selection['rider_payout'],
                    $order['tip_amount'] > 0 ? 'tip_amount' : null => $order['tip_amount'] ?? null,
                    'distance_to_pickup' => round($selection['distance_to_market'], 1),
                    'awaiting_confirmation' => true,
                ],
                "rider.{$selection['rider_id']}"
            );

            //  timeout for client confirmation
            $this->setConfirmationTimeout($order->id, 90);

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Auto-selection failed for order {$order->id}: " . $e->getMessage());

            return false;
        }
    }

    /**
     * Set timeout for client confirmation
     */
    private function setConfirmationTimeout(int $orderId, int $seconds): void
    {
        Redis::setex(
            "order:confirm_timeout:{$orderId}",
            $seconds,
            true
        );
    }

    /**
     * Handle timeout (no client response)
     */
    public function handleRiderNoResponse(int $orderId, string $riderId): void
    {
        $order = Order::findOrFail($orderId);

        if (! $order || $order->order_status !== OrderStatus::RIDER_SELECTED) {
            return;
        }

        // Check if this is still the assigned rider
        if ($order->rider_id !== $riderId) {
            return;
        }

        DB::transaction(function () use ($order, $riderId) {
            // Free the rider
            $rider = Rider::where('user_id', $riderId)->first();
            if ($rider) {
                $rider->setIdle();
            }

            // Reset order
            $order->update([
                'rider_id' => null,
                'order_status' => OrderStatus::PENDING,
                'selected_rider_data' => null,
                'rider_no_response_at' => now(),
            ]);

            // Add to excluded list
            $excludedRiders = Redis::get("order:rejected_riders:{$order->id}");
            $excludedList = $excludedRiders ? json_decode($excludedRiders, true) : [];
            $excludedList[] = $riderId;
            Redis::setex(
                "order:rejected_riders:{$order->id}",
                3600,
                json_encode(array_unique($excludedList))
            );

            // Notify client
            event(new OrderEvent(
                OrderEventActions::ACTION_RIDER_SEARCHING_AGAIN,
                $order,
                [
                    'message' => 'Rider did not respond. Searching for another rider...',
                ]
            ));
        });

        $excludedList = Redis::get("order:rejected_riders:{$order->id}") ? json_decode(Redis::get("order:rejected_riders:{$order->id}"), true) : [];

        // Search for new rider
        $this->autoSelectAndAssign($order, $excludedList);
    }
}
