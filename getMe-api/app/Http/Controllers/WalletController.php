<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\FundWalletRequest;
use App\Http\Requests\WithdrawRequest;
use App\Services\WalletService;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    /**
     * Fund wallet via M-Pesa
     */
    public function fund(FundWalletRequest $request, WalletService $walletService)
    {
        $userId = $request->user()->id;
        $validated = $request->validated();
        
        $response = $walletService->fundWallet(
            phoneNumber: $validated['phone_number'],
            amount: $validated['amount'],
            userId: $userId
        );

        return response()->json($response);
    }

    /**
     * Withdraw from wallet to M-Pesa
     */
    public function withdraw(WithdrawRequest $request, WalletService $walletService)
    {
        $userId = $request->user()->id;
        $validated = $request->validated();
        
        $response = $walletService->withdrawFromWallet(
            phoneNumber: $validated['phone_number'],
            amount: $validated['amount'],
            userId: $userId
        );

        return response()->json($response);
    }

    /**
     * Get wallet balance
     */
    public function balance(Request $request, WalletService $walletService)
    {
        $userId = $request->user()->id;
        
        $response = $walletService->getBalance($userId);
        
        return response()->json($response);
    }

    /**
     * Get transaction history
     */
    public function transactions(Request $request, WalletService $walletService)
    {
        $userId = $request->user()->id;
        $limit = $request->get('limit', 50);
        
        $response = $walletService->getTransactionHistory($userId, $limit);
        
        return response()->json($response);
    }
}