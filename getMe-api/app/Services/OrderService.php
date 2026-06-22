<?php

namespace App\Services;

use App\Enums\OrderEventActions;
use App\Enums\OrderStatus;
use App\Enums\RiderActivityStatus;
use App\Events\OrderEvent;
use App\Jobs\AssignRiderJob;
use App\Models\Order;
use App\Models\OrderLocation;
use App\Models\Rider;
use App\Models\User;
use App\Services\AutoRiderSelectionService;
use App\Services\GeoService;
use App\Services\WalletService;
use Exception;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;


class OrderService
{

    public function __construct(
        protected AutoRiderSelectionService $autoSelectionService,
        protected WalletService $walletService
    ) {}

    /**
     * Create a transient MarketLocation instance (not saved to DB)
     */
    public function makeMarketLocationInstance(array $data): OrderLocation
    {
        return new OrderLocation([
            'lat' => $data['lat'],
            'lng' => $data['lng'],
            'description' => $data['description'] ?? null,
        ]);
    }

    /**
     * Calculate distance between two points using the Haversine formula
     * Accepts either Model instances or arrays with 'lat' and 'lng'
     */
    public function calculateDistanceBetweenPoints($point1, $point2): float
    {
        $lat1 = $point1['lat'] ?? $point1->lat;
        $lng1 = $point1['lng'] ?? $point1->lng;
        $lat2 = $point2['lat'] ?? $point2->lat;
        $lng2 = $point2['lng'] ?? $point2->lng;

        $earthRadius = 6371; 

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);
             
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }

    /**
     * Create a transient DeliveryLocation instance (not saved to DB)
     */
    public function makeDeliveryLocationInstance(User $user, array $data): OrderLocation
    {
        // If you have a delivery_address_id, you might fetch it from DB 
        // Or create a fresh instance from custom lat/lng coordinates
        return new OrderLocation([
            'lat' => $data['delivery_location']['lat'] ?? 0,
            'lng' => $data['delivery_location']['lng'] ?? 0,
            'description' => $data['delivery_location']['description'] ?? null,
            'user_id' => $user->id,
        ]);
    }
    /**
     * Create order from shopping list
     */
    public function createOrderFromShoppingList(
        string $clientId,
        string $shoppingListId,
        float $tipAmount = 0,
        ?string $marketLocation = null,
        ?string $deliveryLocation = null
    ): ?Order {
        try {
            DB::beginTransaction();

            $order = Order::create([
                'client_id' => $clientId,
                'shopping_list_id' => $shoppingListId,
                'tip_amount' => $tipAmount,
                'order_status' => OrderStatus::PENDING,
                'order_number' => $this->generateOrderNumber(),
            ]);

            if ($marketLocation) {
                $order->source_location = $marketLocation;
            }

            if ($deliveryLocation) {
                $order->delivery_location = $deliveryLocation;
            }
            $order->save();

            DB::commit();

            // Trigger rider assignment

            AssignRiderJob::dispatch($order);

            return $order->load(['items', 'marketLocation', 'deliveryLocation']);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to create order from shopping list: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Create regular order (from OrderController)
     */
    public function createRegularOrder(array $data, int $clientId): ?Order
    {
        try {

            DB::beginTransaction();

            $order = Order::create([
                'client_id' => $clientId,
                'market_id' => $data['market_id'],
                'delivery_address' => $data['delivery_address'],
                'delivery_lat' => $data['delivery_lat'],
                'delivery_lng' => $data['delivery_lng'],
                'order_status' => OrderStatus::PENDING,
                'order_number' => $this->generateOrderNumber(),
            ]);

            foreach ($data['items'] as $item) {
                $order->items()->create($item);
            }

            DB::commit();

            AssignRiderJob::dispatch($order, null);

            return $order->load('items');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to create regular order: ' . $e->getMessage());
            return null;
        }
    }

    public function confirmRider(int $orderId, int $clientId): array
    {
        $order = Order::findOrFail($orderId);

        if ($order->client_id !== $clientId) {
            return ['success' => false, 'message' => 'Unauthorized', 'code' => 403];
        }

        if ($order->order_status !== OrderStatus::RIDER_SELECTED) {
            return [
                'success' => false,
                'message' => 'Order is not in selectable state',
                'current_status' => $order->order_status,
                'code' => 422
            ];
        }

        // Check rider availability
        $isRiderAvailable = $this->checkRiderAvailability($order->rider_id);
        if (!$isRiderAvailable) {
            $this->handleRiderUnavailable($order);
            return [
                'success' => false,
                'message' => 'Rider is no longer available. Searching for another rider...',
                'requires_new_search' => true,
                'code' => 409
            ];
        }

        try {
            DB::beginTransaction();

            $order->update([
                'order_status' => OrderStatus::ASSIGNED,
                'confirmed_at' => now(),
            ]);

            $rider = Rider::where('user_id', $order->rider_id)->first();
            if ($rider) {
                $rider->update([
                    'activity_status' => RiderActivityStatus::STATUS_ON_DELIVERY,
                    'current_order_id' => $order->id,
                    'assigned_at' => now(),
                ]);
            }

            DB::commit();

            OrderEvent::dispatch(
                OrderEventActions::ACTION_RIDER_CONFIRMED,
                $order,
                ['message' => 'Rider confirmed for delivery']
            );

            Redis::del("order:confirm_timeout:{$order->id}");

            return [
                'success' => true,
                'message' => 'Rider confirmed successfully',
                'order' => $order->load('rider.user')
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Rider confirmation failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Confirmation failed', 'code' => 500];
        }
    }

    public function rejectRider(int $orderId, int $clientId, ?string $reason = null): array
    {
        $order = Order::findOrFail($orderId);

        if ($order->client_id !== $clientId) {
            return ['success' => false, 'message' => 'Unauthorized', 'code' => 403];
        }

        if ($order->order_status !== OrderStatus::RIDER_SELECTED) {
            return ['success' => false, 'message' => 'No rider to reject', 'code' => 422];
        }

        $rejectedRiderId = $order->rider_id;

        try {
            DB::beginTransaction();

            $rider = Rider::where('user_id', $rejectedRiderId)->first();
            if ($rider) {
                $rider->setIdle();
            }

            $order->update([
                'rider_id' => null,
                'order_status' => OrderStatus::PENDING,
                'selected_rider_data' => null,
                'rejection_reason' => $reason,
                'rejected_at' => now(),
            ]);

            // Store rejected rider
            $rejectedRiders = Redis::get("order:rejected_riders:{$order->id}");
            $rejectedList = $rejectedRiders ? json_decode($rejectedRiders, true) : [];
            $rejectedList[] = $rejectedRiderId;
            Redis::setex(
                "order:rejected_riders:{$order->id}",
                3600,
                json_encode(array_unique($rejectedList))
            );

            DB::commit();

            // Notify and search again
            OrderEvent::dispatch(OrderEventActions::ACTION_RIDER_SEARCHING, $order, [
                'message' => 'Searching for another rider...'
            ]);

            AssignRiderJob::dispatch($order, $rejectedList);

            return ['success' => true, 'message' => 'Rider rejected. Searching for another rider...'];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Rider rejection failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Rejection failed', 'code' => 500];
        }
    }

    private function generateOrderNumber(): string
    {
        return 'ORD-' . strtoupper(uniqid());
    }

    private function checkRiderAvailability(?string $riderId): bool
    {
        if (!$riderId) return false;

        $rider = Rider::where('user_id', $riderId)->first();
        return $rider && ($rider->isIdle() || $rider->status === RiderActivityStatus::STATUS_SELECTED);
    }

    private function handleRiderUnavailable(Order $order): void
    {
        try {
            DB::beginTransaction();
            $order->update([
                'rider_id' => null,
                'order_status' => OrderStatus::PENDING,
                'selected_rider_data' => null,
            ]);
            DB::commit();

            OrderEvent::dispatch(OrderEventActions::ACTION_RIDER_SEARCHING_AGAIN, $order, [
                'message' => 'Rider is no longer available. Searching for another rider...'
            ]);

            $excludedRiders = Redis::get("order:rejected_riders:{$order->id}");
            $excludedList = $excludedRiders ? json_decode($excludedRiders, true) : [];
            AssignRiderJob::dispatch($order, $excludedList);
        } catch (Exception $e) {
            Log::error('Failed to handle unavailable rider: ' . $e->getMessage());
        }
    }


    /**
     * Calculate total estimated cost from items
     */
    public function calculateTotalEstimatedCost(array $items): float
    {
        $total = 0;
        foreach ($items as $item) {
            $total += $item['estimated_price_per_unit'] * $item['quantity'];
        }
        return $total;
    }

    /**
     * Check if wallet balance is sufficient
     *  
     * @return bool
     * 
     */
    public function  sufficinetWalletBalance(string $userId,  float  $estimatedCost)
    {
        $balance =  $this->walletService->getBalance($userId) ?? ['balance' => 0];

        return ($balance['success'] && $balance['available_balance'] >= $estimatedCost);
    }


    /**
     * Create market source location
     */
    public function createMarketLocation(array $marketData): ?OrderLocation
    {
        Log::info('Creating market location', ['data' => $marketData]);
        try {
            $marketLocation = OrderLocation::create([
                'lat' => $marketData['lat'],
                'lng' => $marketData['lng'],
                'description' => $marketData['description'] ?? 'Market Location',
            ]);
            return $marketLocation;
        } catch (Exception $e) {
            Log::error('Failed to create market location: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Create delivery location based on provided address or custom parameters.
     */
    public function createDeliveryLocation(User $client, array $data): ?OrderLocation
    {

    Log::alert('Creating delivery location', ['data' => $data]);
        try {
            if (!empty($data['delivery_address_id'])) {
                $address = $client->addresses()->where('id', $data['delivery_address_id'])->first();

                if (!$address) {
                    Log::error("Explicit address ID {$data['delivery_address_id']} not found for client ID: {$client->id}");
                    throw new \InvalidArgumentException('The selected saved address could not be found.');
                }

                // Pass the specific loaded address record to your creator method
                return $this->createDeliveryLocationFromAddressRecord($address);
            }

           
                return $this->createDeliveryLocationFromRequest($data['delivery_location']);

            // Fallback safety checkpoint
            // throw new \InvalidArgumentException('Delivery destination missing: require either a valid saved address or map coordinates.');

        } catch (\Exception $e) {
            Log::error('Failed to create delivery location for client ID: ' . ($client->id ?? 'unknown') . ' - ' . $e->getMessage());
            throw new \RuntimeException('Unable to create delivery location', 0, $e);
        }
    }
    public function createDeliveryLocationFromRequest(array $data): ?OrderLocation
    {


        return OrderLocation::create([
            'lat' => $data['lat'],
            'lng' => $data['lng'],
            'description' => $data['description'] ?? 'Delivery Location',
        ]);
    }


    public function createDeliveryLocationFromDefaultAddress(User $client): ?OrderLocation
    {

        // Load client with addresses
        $client->load(['addresses']);

        Log::info('Fetched addresses', ['addesses' => $client->addresses->toArray()]);

        if ($client->addresses->isEmpty()) {
            Log::error('No addresses found for the client.');
            throw new Exception('No addresses found for the client.');
        }
        // Find default address
        $defaultAddress = $client->addresses()->where('is_default', true)->first();

        if (!$defaultAddress) {
            throw new Exception('No default address found. Please set a default address first.');
        }

        // Build description from address components
        $description = $this->formatAddressDescription($defaultAddress);



        return OrderLocation::create([
            'lat' => $defaultAddress->latitude,
            'lng' => $defaultAddress->longitude,
            'description' => $description,
        ]);
    }


    /**
     * Format address description
     */
    public function formatAddressDescription($address): string
    {
        $parts = [];

        if ($address->city) $parts[] = $address->city;
        if ($address->street) $parts[] = "Street: {$address->street}";
        if ($address->estate) $parts[] = "Estate: {$address->estate}";
        if ($address->house_number) $parts[] = "Hs.No: {$address->house_number}";

        return implode(' | ', $parts);
    }


    public function  getOrderDistance(Order $order)
    {
        $marketData = [
            'lat' => $order->marketLocation->lat,
            'lng' => $order->marketLocation->lng,
            'member' => 'market:' . $order->market_id,
        ];

        $deliveryData = [
            'lat' => $order->deliveryLocation->lat,
            'lng' => $order->deliveryLocation->lng,
            'member' => 'client:' . $order->client_id,
        ];

        $geo =   App::make(GeoService::class);
        $geo->addMultiplePoints([$marketData, $deliveryData]);
        $distance = $geo->calculateDistance($marketData['member'], $deliveryData['member']);
        // remove locations
        $geo->removeMultiple('getme:geo_track', [$marketData, $deliveryData]);

        return $distance;
    }
}
