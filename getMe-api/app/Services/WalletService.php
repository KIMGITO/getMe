<?php

namespace App\Services;

use App\Events\MpesaTransactionUpdated;
use App\Models\Finance\Wallet;
use App\Models\User;
use App\Services\Finance\MpesaService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WalletService
{
    public function __construct(
        protected MpesaService $mpesaService
    ) {}

    /**
     * Fund wallet via M-Pesa
     */
    public function fundWallet(string $phoneNumber, float $amount, string $userId): array
    {
        // Validate amount
        if ($amount < 1 || $amount > 150000) {
            return [
                'success' => false,
                'message' => 'Amount must be between 1 and 150,000 KES'
            ];
        }

        // Check if user has a wallet
        $wallet = Wallet::where('user_id', $userId)->first();
        if (!$wallet) {
            return [
                'success' => false,
                'message' => 'Wallet not found for this user'
            ];
        }

        // Generate unique reference
        $reference = 'Get Me Wallet';

        // Broadcast: Initiation started
        // MpesaTransactionUpdated::broadcast(
        //     userId: $userId,
        //     message: 'Initiating M-Pesa payment request...',
        //     success: true
        // );

        // Initiate M-Pesa STK Push
        $response = $this->mpesaService->mpesaStkPush(
            phone: $phoneNumber,
            amount: $amount,
            account_reference: $reference,
            description: 'Wallet funding',
            userId: $userId
        );

        if ($response === false) {
            // Broadcast: Failure
            MpesaTransactionUpdated::broadcast(
                userId: $userId,
                message: 'Failed to initiate M-Pesa payment. Please try again.',
                success: false
            );

            return [
                'success' => false,
                'message' => 'Failed to initiate M-Pesa payment. Please try again.'
            ];
        }

        // Broadcast: Success - waiting for PIN
        // MpesaTransactionUpdated::broadcast(
        //     userId: $userId,
        //     message: 'STK Push sent! Please check your phone and enter your PIN to complete payment.',
        //     success: true
        // );

        return [
            'success' => true,
            'message' => 'M-Pesa payment request sent. Please check your phone and enter PIN.',
            'checkout_request_id' => $response,
            'reference' => $reference
        ];
    }

    /**
     * Withdraw from wallet to M-Pesa
     */
    public function withdrawFromWallet(string $phoneNumber, float $amount, string $userId): array
    {
        // Check if user has sufficient balance
        $wallet = Wallet::where('user_id', $userId)->first();

        if (!$wallet) {
            return [
                'success' => false,
                'message' => 'Wallet not found'
            ];
        }

        if ($wallet->cached_balance < $amount) {
            MpesaTransactionUpdated::broadcast(
                userId: $userId,
                message: 'Insufficient balance for withdrawal',
                success: false
            );

            return [
                'success' => false,
                'message' => 'Insufficient balance',
                'balance' => $wallet->cached_balance
            ];
        }

        // Validate amount
        if ($amount < 10 || $amount > 150000) {
            return [
                'success' => false,
                'message' => 'Withdrawal amount must be between 10 and 150,000 KES'
            ];
        }

        // Broadcast: Withdrawal initiated
        MpesaTransactionUpdated::broadcast(
            userId: $userId,
            message: "Initiating withdrawal of {$amount} KES to {$phoneNumber}...",
            success: true
        );

        // Initiate B2C withdrawal
        $response = $this->mpesaService->b2cWithdrawal(
            // phone: $phoneNumber,
            phone: '254708374149',
            amount: $amount,
            userId: $userId,
            reason: 'Wallet withdrawal'
        );

        if ($response === false) {
            MpesaTransactionUpdated::broadcast(
                userId: $userId,
                message: 'Withdrawal failed. Please try again.',
                success: false
            );

            return [
                'success' => false,
                'message' => 'Failed to process withdrawal. Please try again.'
            ];
        }

        return [
            'success' => true,
            'message' => 'Withdrawal request sent successfully',
            'reference' => $response['ConversationID'] ?? null
        ];
    }

    /**
     * Hold wallet balance for transactions.
     */
     public function holdBalance(float $amount, string $userId)
    {
        $wallet =  Wallet::where('user_id', $userId)->first();

        if (!$wallet) {
            return [
                'success' => false,
                'message' => 'Wallet not found'
            ];
        }

        if ($wallet->cached_held_balance + $amount > $wallet->cached_balance) {
            return [
                'success' => false,
                'message' => 'Insufficient balance'
            ];
        }

        $wallet->update(['cached_balance' => DB::raw('cached_balance - ' . $amount), 'cached_held_balance' => DB::raw('cached_held_balance + ' . $amount)]);
        return [
            'success' => true,
            'message' => 'Balance held successfully'
        ];
    }

    /**
     * Get wallet balance
     */
    public function getBalance(string $userId): array
    {
        $wallet = Wallet::where('user_id', $userId)->first();
        if (!$wallet) {
            return [
                'success' => false,
                'message' => 'Wallet not found',
                'balance' => 0
            ];
        }

        return [
            'success' => true,
            'total_assest' => $wallet->cached_balance,
            'held_balance' => $wallet->cached_held_balance,
            'currency' => $wallet->currency,
            'available_balance' => $wallet->cached_balance - $wallet->cached_held_balance
        ];
    }

    /**
     * Get transaction history
     */
    public function getTransactionHistory(string $userId, int $limit = 50): array
    {
        $transactions = \App\Models\Finance\Transaction::whereHas('journalEntries.journalLines.ledgerAccount', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->with(['journalEntries.journalLines' => function ($query) use ($userId) {
                $query->whereHas('ledgerAccount', function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                });
            }])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return [
            'success' => true,
            'transactions' => $transactions,
            'count' => $transactions->count()
        ];
    }
}
