<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderLocation;
use App\Models\ShoppingList;
use App\Services\GeoService;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;

class ShoppingListService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }



    /**
     * Create shopping list
     */
    public function createShoppingList(array $data, string $clientId, float $totalEstimatedCost): ?ShoppingList
    {
        $shoppingListData = Arr::except($data, ['items', 'market_location']);
        $shoppingListData['client_id'] = $clientId;
        $shoppingListData['total_estimated_cost'] = $totalEstimatedCost;

        // Parse preferred pickup time if provided
        if (!empty($shoppingListData['preferred_pickup_start_time'])) {
            $shoppingListData['preferred_pickup_start_time'] = Carbon::parse($shoppingListData['preferred_pickup_start_time']);
        }

        return ShoppingList::create($shoppingListData);
    }

    /**
     * Create shopping items
     */
    public function createShoppingItems(ShoppingList $shoppingList, array $items): bool
    {
        try {
            $shoppingList->items()->createMany($items);
            return true;
        } catch (Exception $e) {
            Log::error('Failed to create shopping items: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Create order
     */
    public function initiateOrder(array  $data): ?Order
    {
        try {
            return Order::create($data);
        } catch (Exception $e) {
            Log::error('Failed to create order: ' . $e->getMessage());
            return null;
        }
    }



    

   
    /**
     * Get order dostance Market to Delivery  location
     */

    public function getOrderDistance(Order $order): float
    {

        $order = $order->fresh(['sourceLocation', 'deliveryLocation']);
        $source = ['lat' => $order->sourceLocation->lat, 'lng' => $order->sourceLocation->lng,  'member' => 'Market: ' . $order->sourceLocation->id];
        $destination = [$order->deliveryLocation->lat, $order->deliveryLocation->lng, 'member' => 'Destination:' . $order->deliveryLocation->id];
        
        App::make(GeoService::class)->addMultiplePoints([
            $source,
            $destination
        ]);
    }

    /**
     * Refresh order with all relationships
     */
    public function refreshOrderWithRelations(Order $order): Order
    {
        return $order->fresh([
            'shoppingList',
            'shoppingList.items',
            'sourceLocation',
            'deliveryLocation'
        ]);
    }

    /**
     * Return success response
     */
    public function successResponse(Order $order, ShoppingList $shoppingList): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Shopping list created successfully',
            'order_number' => $order->order_number,
            'data' => [
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->order_status,
                    'created_at' => $order->created_at,
                ],
                'shopping_list' => [
                    'id' => $shoppingList->id,
                    'total_estimated_cost' => $shoppingList->total_estimated_cost,
                    'preferred_pickup_start_time' => $shoppingList->preferred_pickup_start_time,
                    'notes' => $shoppingList->notes,
                ],
                'items' => $shoppingList->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'quantity' => $item->quantity,
                        'estimated_price_per_unit' => $item->estimated_price_per_unit,
                        'total_price' => $item->estimated_price_per_unit * $item->quantity,
                    ];
                }),
                'locations' => [
                    'market' => $order->sourceLocation,
                    'delivery' => $order->deliveryLocation,
                ],
            ],
        ], 201);
    }

    /**
     * Return error response
     */
    public function errorResponse(string $message, int $statusCode = 400): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], $statusCode);
    }
}
