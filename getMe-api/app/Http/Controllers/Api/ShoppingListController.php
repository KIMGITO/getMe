<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShoppingListRequest;
use App\Services\OrderService;
use App\Services\ShoppingListService;
use App\Services\TransportFeeCalculator;
use App\Services\WalletService;
use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ShoppingListController extends Controller
{
    public function store(
        ShoppingListRequest $request,
        ShoppingListService $shoppingListService,
        OrderService $orderService,
        TransportFeeCalculator $feeCalculator,
        WalletService $walletService
    ) {
        $data = $request->validated();
        $client = $request->user();



        try {
            DB::beginTransaction();
            // Create shopping list
            $estimatedItemsCost = $orderService->calculateTotalEstimatedCost($data['items']);

            $shoppingList = $shoppingListService->createShoppingList(
                Arr::except($data, ['items', 'tip_amount', 'market_location']),
                $client->id,
                $estimatedItemsCost
            );

            if (!$shoppingList) {
                DB::rollBack();
                return $shoppingListService->errorResponse('Failed to create shopping list', 500);
            }

            // Create shopping items
            $itemsCreated = $shoppingListService->createShoppingItems($shoppingList, $data['items']);
            if (!$itemsCreated) {
                DB::rollBack();
                return $shoppingListService->errorResponse('Failed to create shopping items', 500);
            }

            // Create market location
            $marketLocation = $orderService->createMarketLocation($data['market_location']);
            if (!$marketLocation) {
                DB::rollBack();
                return $shoppingListService->errorResponse('Failed to create market location', 500);
            }
            // Create delivery location
            $deliveryLocation = $orderService->createDeliveryLocation($client, $data);

            if (!$deliveryLocation) {
                DB::rollBack();
                return $shoppingListService->errorResponse('Failed to create delivery location', 500);
            }
            DB::commit();

            $order = $orderService->createOrderFromShoppingList(
                $client->id,
                $shoppingList->id,
                $data['tip_amount'] ?? 0,
                $marketLocation->id,
                $deliveryLocation->id
            );

            // get order distance
            $distance = $orderService->getOrderDistance($order);

            $deliveryCost = $feeCalculator->reset()->setDistance($distance)->setNightTime(now() >= '20:00' && now() <= '06:00')->calculate();
            $customerPays = $deliveryCost['customer_pays'];

            if (!$orderService->sufficinetWalletBalance($client->id, ($estimatedItemsCost + $customerPays))) {
                DB::rollBack();
                Log::error('Insufficient wallet balance for order and delivery fee', [
                    'client_id' => $client->id,
                    'trace' => 'Insufficient wallet balance for order and delivery fee',
                ]);
                return $shoppingListService->errorResponse('Insufficient wallet balance for order and delivery fee', 422);
            }


            if (!$order) {
                return $shoppingListService->errorResponse('Failed to create order', 500);
            }

            $cost = $estimatedItemsCost + $customerPays;


            // hold balance
            $healed = $walletService->holdBalance($cost, $client->id);


            if (!$healed['success']) {
                DB::rollBack();
                return $shoppingListService->errorResponse($healed['message'], 500);
            }

            Log::info('Order created successfully', [
                'client_id' => $client->id,
                'order_id' => $order->id,
                'cost' => $cost,
                'order' => $order->load(['marketLocation', 'deliveryLocation', 'shoppingList', 'shoppingList.items']),
            ]);
            return $shoppingListService->successResponse($order, $shoppingList);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Order creation failed: ' . $e->getMessage(), [
                'client_id' => $client->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return $shoppingListService->errorResponse('Failed to create order: ' . $e->getMessage(), 500);
        }
    }
}
