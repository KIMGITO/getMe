<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShoppingList;
use App\Services\OrderService;
use App\Services\ShoppingListService;
use App\Services\TransportFeeCalculator;
use App\Services\WalletService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ShoppingListController extends Controller
{
    public function __construct(
        protected ShoppingListService $shoppingListService,
        protected OrderService $orderService,
        protected TransportFeeCalculator $feeCalculator,
        protected WalletService $walletService
    ) {}

    public function  index(Request $request): JsonResponse
    {
        $client =  $request->user();

        $orders = ShoppingList::with('items')->where('client_id', $client->id)->get();

        return response()->json([
            'success' => true,
            'orders' => $orders
        ], 200);
    }

    
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'preferred_pickup_start_time' => 'nullable|date',
            'note_for_rider' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.estimated_price_per_unit' => 'required|numeric|min:0',
            'items.*.unit' => 'required|string',
        ]);

        $client = $request->user();
        $itemsData = $request->input('items');

        try {
            return DB::transaction(function () use ($client, $request, $itemsData) {
                $estimatedItemsCost = $this->orderService->calculateTotalEstimatedCost($itemsData);

                // Create base list record
                $shoppingList = $this->shoppingListService->createShoppingList(
                    $request->only(['title', 'preferred_pickup_start_time', 'note_for_rider']),
                    $client->id,
                    $estimatedItemsCost
                );

                // Populating items
                $this->shoppingListService->createShoppingItems($shoppingList, $itemsData);

                return response()->json([
                    'success' => true,
                    'message' => 'Shopping list created successfully.',
                    'shopping_list_id' => $shoppingList->id,
                    'estimated_items_cost' => $estimatedItemsCost
                ], 201);
            });
        } catch (Exception $e) {
            Log::error('Standalone shopping list creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to save shopping list'], 500);
        }
    }

    /**
     * TASK 2: Dynamic Fee Preview Calculator
     * POST /api/shopping-lists/{id}/preview-fee
     */
    public function previewFee(Request $request, $id): JsonResponse
    {
        $request->validate([
            'market_location' => 'required|array',
            'market_location.lat' => 'required|numeric',
            'market_location.lng' => 'required|numeric',
            'delivery_location' => 'nullable|array', // custom coordinates fallback
            'delivery_address_id' => 'nullable|ulid', // saved address fallback
        ]);

        $shoppingList = ShoppingList::where('client_id', $request->user()->id)->findOrFail($id);

        try {
    // 1. Dry run building temporary location instances
    $marketLocMock = $this->orderService->makeMarketLocationInstance($request->input('market_location'));
    $deliveryLocMock = $this->orderService->makeDeliveryLocationInstance($request->user(), $request->all());

    // 2. Compute distance
    $distance = $this->orderService->calculateDistanceBetweenPoints($marketLocMock, $deliveryLocMock);

    // 3. Execute pricing rules
    $feeCalculation = $this->feeCalculator
        ->reset()
        ->setDistance($distance)
        ->setNightTime(now()->between('20:00', '06:00'))
        ->calculate();

    $customerPays = $feeCalculation['customer_pays'];
    $totalCost = (float) $shoppingList->total_estimated_cost + (float) $customerPays;

    // 4. Safely get the numeric balance
    $rawBalance = $this->walletService->getBalance($request->user()->id);
  
        $currentBalance = is_array($rawBalance) ? (float) ($rawBalance['available_balance'] ?? 0) : (float) $rawBalance;
    // 5. Check if user has enough funds
    $hasEnoughFunds = $currentBalance >= $totalCost;

    return response()->json([
    // Round to 2 decimal places
    'distance_km' => round($distance, 2), 
    
    // Round to nearest whole number (cast to int to remove .0)
    'delivery_fee' => (int) round($customerPays),
    'items_estimated_cost' => (int) round($shoppingList->total_estimated_cost),
    'total_order_cost' => (int) round($totalCost),
    
    'wallet_sufficient' => $hasEnoughFunds,
    
    // Round to nearest whole number
    'suggested_topup_amount' => $hasEnoughFunds ? 0 : (int) round($totalCost - $currentBalance)
]);

} catch (Exception $e) {
    Log::error('Fee preview calculation break: ' . $e->getMessage());
    return response()->json(['error' => 'Could not calculate delivery matrix costs'], 500);
}
    }

    /**
     * TASK 3: Final Authorization Checkout
     * POST /api/shopping-lists/{id}/checkout
     */
    public function checkout(Request $request, $id): JsonResponse
    {
        $request->validate([
            'market_location' => 'required|array',
            'delivery_location' => 'nullable|array',
            'delivery_address_id' => 'nullable|ulid',
            'tip_amount' => 'nullable|numeric|min:0',
        ]);

        $client = $request->user();
        $shoppingList = ShoppingList::with('items')->where('client_id', $client->id)->findOrFail($id);

        try {
            return DB::transaction(function () use ($client, $shoppingList, $request) {
                
                // 1. Persist final location reference models
                $marketLocation = $this->orderService->createMarketLocation($request->input('market_location'));
                $deliveryLocation = $this->orderService->createDeliveryLocation($client, $request->all());

                // 2. Build explicit Order record
                $order = $this->orderService->createOrderFromShoppingList(
                    $client->id,
                    $shoppingList->id,
                    $request->input('tip_amount', 0),
                    $marketLocation->id,
                    $deliveryLocation->id
                );

                // 3. Recalculate Final Fee inside transaction boundary for accuracy
                $distance = $this->orderService->getOrderDistance($order);
                $feeMatrix = $this->feeCalculator->reset()->setDistance($distance)->calculate();
                $finalCost = $shoppingList->total_estimated_cost + $feeMatrix['customer_pays'];

                // 4. Validate Balance 
                if (!$this->orderService->sufficinetWalletBalance($client->id, $finalCost)) {
                    throw new Exception('Insufficient funds. Please top up your wallet before checking out.', 422);
                }

                // 5. Escrow Hold Placement
                $escrow = $this->walletService->holdBalance($finalCost, $client->id);
                if (!$escrow['success']) {
                    throw new Exception($escrow['message'], 500);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Order checked out and dispatched!',
                    'order' => $order->load(['marketLocation', 'deliveryLocation', 'shoppingList.items'])
                ]);
            });

        } catch (Exception $e) {
            Log::error('Checkout failure for shopping list ' . $id . ': ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], $e->getCode() === 422 ? 422 : 500);
        }
    }

    
}