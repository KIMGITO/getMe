<?php
// app/Services/Finance/Gateways/MpesaCallbackHandler.php

namespace App\Services\Finance\Gateways;

use App\Services\Finance\DTOs\TransactionData;
use App\Services\Finance\Transactions\TransactionProcessor;
use App\Services\Finance\MpesaService;
use Illuminate\Support\Facades\Log;

class MpesaCallbackHandler
{
    public function __construct(
        private readonly TransactionProcessor $processor,
        private readonly MpesaService $mpesa
    ) {}

    public function handle(string $userId, array $callbackData, string $transactionType): array
    {
        Log::info('Processing M-Pesa transaction', [
            'user_id' => $userId,
            'callback_data' => $callbackData
        ]);
         
        try {
            // Create DTO from callback data
            $transactionData = TransactionData::fromMpesaCallback(
                userId: $userId,
                callbackData: $callbackData,
                transactionType: $transactionType
            );

            // Process the transaction
            $result = $this->processor->processDeposit($transactionData);

            Log::info('M-Pesa transaction processed successfully', [
                'user_id' => $userId,
                'reference' => $transactionData->referenceId,
                'amount' => $transactionData->amount
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error('M-Pesa transaction failed', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'callback_data' => $callbackData
            ]);

            throw $e;
        }
    }
}
