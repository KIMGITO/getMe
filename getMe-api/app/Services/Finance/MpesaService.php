<?php
// app/Services/Finance/MpesaService.php

namespace App\Services\Finance;

use App\Events\MpesaTransactionUpdated;
use App\Models\DarajaTransaction;
use App\Services\Finance\Transactions\TransactionProcessor;
use Codenson\Daraja\Facades\Daraja;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class MpesaService
{
    //   Stk request
    public function mpesaStkPush(string $phone, float $amount, string $account_reference, string $description, string $userId)
    {
        try {
            $response = Daraja::stkPush()->request([
                'amount' => $amount,
                'phone_number' => $phone,
                'account_reference' => $account_reference,
                'transaction_desc' => $description,
            ]);

            if ($response['ResponseCode'] != 0) {
                MpesaTransactionUpdated::broadcast($userId, 'M-Pesa request failed: ' . ($response['ResponseDescription'] ?? 'Unknown error'));
                return false;
            }

            Redis::setex($response['CheckoutRequestID'], 120, $userId);
            MpesaTransactionUpdated::broadcast($userId, 'M-Pesa payment request sent. Please check your phone and enter your PIN.');

            Log::info('MpesService Reesponse :payment request sent', [
                'user_id' => $userId,
                'phone_number' => $phone,
                'amount' => $amount,
                'response' => $response
            ]);

            return $response['CheckoutRequestID'];
        } catch (\Exception $e) {
            Log::error('STK Push failed', ['error' => $e->getMessage()]);
            MpesaTransactionUpdated::broadcast($userId, 'Failed to initiate payment. Please try again.');
            return false;
        }
    }

    /**
     * ONLY makes B2C API call - NO RECORDING
     */
    public function b2cWithdrawal(string $phone, float $amount, string $userId, string $reason = 'Withdrawal from  wallet')
    {
        try {
            $fee = $this->calculateB2CCharge($amount);
            $totalAmount = $amount + $fee;

            $response = Daraja::b2c()->request([
                'amount' => $totalAmount,
                'phone_number' => $phone,
                'command_id' => 'BusinessPayment',
                'remarks' => $reason,
                'occasion' => $reason
            ]);

            if (!isset($response['ResultCode']) || $response['ResultCode'] != 0) {
                MpesaTransactionUpdated::broadcast($userId, 'Withdrawal failed: ' . ($response['ResultDesc'] ?? 'Unknown error'));
                return false;
            }

            MpesaTransactionUpdated::broadcast($userId, "Withdrawal request sent. You will receive {$amount} KES on {$phone}.");
            return $response;
        } catch (\Exception $e) {
            Log::error('B2C Withdrawal failed', ['error' => $e->getMessage()]);
            MpesaTransactionUpdated::broadcast($userId, 'Withdrawal failed. Please try again.');
            return false;
        }
    }

    /**
     * Handle STK Callback - Delegates recording to TransactionProcessor
     */
    public function stkCallback(array $data, TransactionProcessor $processor)
    {
        try {
            $stkCallback = $data['Body']['stkCallback'] ?? [];

            if (empty($stkCallback)) {
                Log::error('Invalid STK callback data');
                return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Invalid data']);
            }

            // Store raw transaction
            $metadata = $stkCallback['CallbackMetadata']['Item'] ?? [];
            DarajaTransaction::create([
                'transaction_type' => 'STK',
                'merchant_request_id' => $stkCallback['MerchantRequestID'] ?? null,
                'checkout_request_id' => $stkCallback['CheckoutRequestID'] ?? null,
                'result_code' => $stkCallback['ResultCode'] ?? null,
                'result_desc' => $stkCallback['ResultDesc'] ?? null,
                'amount' => $metadata[0]['Value'] ?? null,
                'mpesa_receipt_number' => $metadata[1]['Value'] ?? null,
                'phone_number' => $metadata[4]['Value'] ?? null,
                'raw_response' => json_encode($data)
            ]);

            // Call TransactionProcessor for recording
            if (($stkCallback['ResultCode'] ?? 1) === 0) {
                $processor->recordSuccessfulDeposit($stkCallback);
            } else {
                $processor->recordFailedPayment($stkCallback);
            }

            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Success']);
        } catch (\Exception $e) {
            Log::error('STK Callback processing failed', ['error' => $e->getMessage()]);
            return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Processing failed']);
        }
    }

    /**
     * Fee calculation methods
     */
    private function calculateB2CCharge(float $amount): float
    {
        $amount = ceil($amount);
        if ($amount <= 100) return 0.00;
        if ($amount <= 500) return 7.00;
        if ($amount <= 1000) return 13.00;
        if ($amount <= 1500) return 23.00;
        if ($amount <= 2500) return 33.00;
        if ($amount <= 3500) return 53.00;
        if ($amount <= 5000) return 57.00;
        if ($amount <= 7500) return 78.00;
        if ($amount <= 10000) return 90.00;
        if ($amount <= 15000) return 100.00;
        if ($amount <= 20000) return 105.00;
        if ($amount <= 35000) return 108.00;
        if ($amount <= 50000) return 110.00;
        if ($amount <= 100000) return 115.00;
        if ($amount <= 150000) return 120.00;
        return 120.00;
    }

    private function calculateC2BPaybillCharge(float $amount): float
    {
        $amount = ceil($amount);
        if ($amount <= 100) return 0.00;
        if ($amount <= 500) return 5.00;
        if ($amount <= 1000) return 23.00;
        if ($amount <= 1500) return 28.00;
        if ($amount <= 2500) return 33.00;
        if ($amount <= 3500) return 48.00;
        if ($amount <= 5000) return 34.00;
        if ($amount <= 7500) return 54.00;
        if ($amount <= 10000) return 64.00;
        if ($amount <= 15000) return 78.00;
        if ($amount <= 20000) return 93.00;
        if ($amount <= 30000) return 98.00;
        if ($amount <= 45000) return 103.00;
        if ($amount <= 100000) return 105.00;
        if ($amount <= 150000) return 106.00;
        if ($amount <= 250000) return 108.00;
        return 108.00;
    }
}
