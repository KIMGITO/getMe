<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    private OrderService $orderService;
    
    public function __construct(OrderService $orderService,  )
    {
        $this->orderService = $orderService;
    }
    
    public function store(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'client') {
            return response()->json(['message' => 'Invalid action'], 403);
        }
        
        $validated = $request->validate([
            'market_id' => 'required|exists:markets,id',
            'delivery_address' => 'required|string',
            'delivery_lat' => 'required|numeric',
            'delivery_lng' => 'required|numeric',
            'items' => 'required|array',
        ]);

        $estimatedCost = $this->orderService->calculateTotalEstimatedCost($validated['items']);
        
        $order = $this->orderService->createRegularOrder($validated, $user->id);
        
        if (!$order) {
            return response()->json(['message' => 'Failed to place order'], 500);
        }
        
        return response()->json([
            'message' => 'Order placed successfully. Searching for nearest rider...',
            'order' => $order,
        ]);
    }
    
    public function confirmRider(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);
        
        $result = $this->orderService->confirmRider(
            $validated['order_id'],
            $request->user()->id
        );
        
        return response()->json(
            ['message' => $result['message'], 'order' => $result['order'] ?? null],
            $result['code'] ?? 200
        );
    }
    
    public function rejectRider(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'reason' => 'nullable|string|max:500',
        ]);
        
        $result = $this->orderService->rejectRider(
            $validated['order_id'],
            $request->user()->id,
            $validated['reason'] ?? null
        );
        
        return response()->json(
            ['message' => $result['message']],
            $result['code'] ?? 200
        );
    }


    
}