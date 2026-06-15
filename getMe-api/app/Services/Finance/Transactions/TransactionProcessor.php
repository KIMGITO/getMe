<?php
// app/Services/Finance/Transactions/TransactionProcessor.php

namespace App\Services\Finance\Transactions;

use App\Enums\Gateways;
use App\Enums\PaymentIntentStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Events\MpesaTransactionUpdated;
use App\Models\Finance\JournalLine;
use App\Models\Finance\LedgerAccount;
use App\Models\Finance\Transaction;
use App\Models\Finance\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class TransactionProcessor
{
    /**
     * Record successful deposit from M-Pesa callback
     */
    public function recordSuccessfulDeposit(array $stkCallback): void
    {
        try {
            DB::beginTransaction();

            // Extract data
            $metadata = $stkCallback['CallbackMetadata']['Item'] ?? [];
            $amount = $metadata[0]['Value'] ?? 0;
            $receiptNumber = $metadata[1]['Value'] ?? null;
            $phoneNumber = $metadata[4]['Value'] ?? null;

            // Get user from Redis
            $userId = Redis::get($stkCallback['CheckoutRequestID']);
            if (!$userId) {
                Log::error('User not found for checkout', ['checkout_id' => $stkCallback['CheckoutRequestID']]);
                DB::rollBack();
                return;
            }

            // Calculate fee (customer pays)
            $fee = $this->calculateC2BPaybillCharge($amount);
            $netAmount = $amount - $fee;

            $userLedger = LedgerAccount::where('user_id', $userId)
                ->where('classification', 'asset')
                ->firstOrFail();

            $revenueAccount = LedgerAccount::where('code', '4020') // Order Processing Commission
                ->whereNull('user_id')
                ->firstOrFail();

            $settlementAccount = LedgerAccount::where('code', '1020') // M-Pesa Settlement Account
                ->whereNull('user_id')
                ->firstOrFail();

            $feeExpenseAccount = LedgerAccount::where('code', '5010') // M-Pesa Transaction Fees
                ->whereNull('user_id')
                ->firstOrFail();

            // Create transaction
            $transaction = Transaction::create([
                'id' => (string) Str::ulid(),
                'reference_id' => $receiptNumber,
                'amount' => $amount,
                'type' => TransactionType::DEPOSIT,
                'status' => TransactionStatus::COMPLETED,
                'metadata' => json_encode($stkCallback)
            ]);

            // Create payment intent
            $paymentIntent = $transaction->paymentIntents()->create([
                'id' => (string) Str::ulid(),
                'gateway' => Gateways::MPESA,
                'external_amount' => $amount,
                'gateway_fee' => $fee,
                'net_amount' => $netAmount,
                'status' => PaymentIntentStatus::SUCCESS,
                'gateway_response' => json_encode($metadata),
                'gateway_ref' => $receiptNumber
            ]);

            // Create journal entry
            $journalEntry = $transaction->journalEntries()->create([
                'id' => (string) Str::ulid(),
                'description' => "Wallet funding - {$receiptNumber}",
                'posted_at' => now()
            ]);

            // Journal lines (double entry accounting)
            // 1. Debit user wallet (asset increases)
            JournalLine::create([
                'id' => (string) Str::ulid(),
                'journal_entry_id' => $journalEntry->id,
                'ledger_account_id' => $userLedger->id,
                'debit' => $netAmount,
                'credit' => 0,
                'currency' => 'KES'
            ]);

            // 2. Credit revenue account (revenue recognized)
            JournalLine::create([
                'id' => (string) Str::ulid(),
                'journal_entry_id' => $journalEntry->id,
                'ledger_account_id' => $revenueAccount->id,
                'debit' => 0,
                'credit' => $amount,
                'currency' => 'KES'
            ]);

            // 3. Credit settlement account (liability/asset adjustment)
            JournalLine::create([
                'id' => (string) Str::ulid(),
                'journal_entry_id' => $journalEntry->id,
                'ledger_account_id' => $settlementAccount->id,
                'debit' => 0,
                'credit' => $amount,
                'currency' => 'KES'
            ]);

            // 4. Debit fee expense account (if fee > 0)
            if ($fee > 0) {
                JournalLine::create([
                    'id' => (string) Str::ulid(),
                    'journal_entry_id' => $journalEntry->id,
                    'ledger_account_id' => $feeExpenseAccount->id,
                    'debit' => $fee,
                    'credit' => 0,
                    'currency' => 'KES'
                ]);
            }

            // Update wallet cache
            $wallet = Wallet::where('user_id', $userId)->first();
            if ($wallet) {
                $newBalance = JournalLine::where('ledger_account_id', $userLedger->id)
                    ->sum(DB::raw('debit - credit'));
                $wallet->update([
                    'cached_balance' => $newBalance,
                    'version' => $wallet->version + 1
                ]);
            }

            DB::commit();

            // Broadcast success
            $message = "{$receiptNumber} Confirmed, Payment of " . number_format($amount, 2) . " KES completed.";
            // if ($fee > 0) {
            //     $message .= " (Fee: " . number_format($fee, 2) . " KES)";
            // }
            MpesaTransactionUpdated::broadcast($userId, $message);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to record deposit', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'checkout_id' => $stkCallback['CheckoutRequestID'] ?? null
            ]);

            if (isset($userId)) {
                MpesaTransactionUpdated::broadcast($userId, 'Payment failed to record: ' . $e->getMessage());
            }
        }
    }

    /**
     * Record order payment from wallet
     */
    public function recordOrderPayment(string $userId, float $amount, string $orderId, array $metadata = []): void
    {
        try {
            DB::beginTransaction();

            // Get accounts
            $userLedger = LedgerAccount::where('user_id', $userId)
                ->where('classification', 'asset')
                ->firstOrFail();

            $escrowAccount = LedgerAccount::where('code', '2020') // Customer Order Escrow
                ->whereNull('user_id')
                ->firstOrFail();

            $deliveryRevenueAccount = LedgerAccount::where('code', '4010') // Delivery Service Revenue
                ->whereNull('user_id')
                ->firstOrFail();

            // Create transaction
            $transaction = Transaction::create([
                'id' => (string) Str::ulid(),
                'reference_id' => $orderId,
                'amount' => $amount,
                'type' => TransactionType::PAYMENT,
                'status' => TransactionStatus::COMPLETED,
                'metadata' => json_encode($metadata)
            ]);

            // Create journal entry
            $journalEntry = $transaction->journalEntries()->create([
                'id' => (string) Str::ulid(),
                'description' => "Order payment - Order #{$orderId}",
                'posted_at' => now()
            ]);

            // 1. Credit user wallet (asset decreases)
            JournalLine::create([
                'id' => (string) Str::ulid(),
                'journal_entry_id' => $journalEntry->id,
                'ledger_account_id' => $userLedger->id,
                'debit' => 0,
                'credit' => $amount,
                'currency' => 'KES'
            ]);

            // 2. Debit escrow account (liability increases - holding customer money)
            JournalLine::create([
                'id' => (string) Str::ulid(),
                'journal_entry_id' => $journalEntry->id,
                'ledger_account_id' => $escrowAccount->id,
                'debit' => $amount,
                'credit' => 0,
                'currency' => 'KES'
            ]);

            DB::commit();

            Log::info('Order payment recorded', [
                'user_id' => $userId,
                'amount' => $amount,
                'order_id' => $orderId,
                'transaction_id' => $transaction->id
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to record order payment', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
                'order_id' => $orderId
            ]);

            throw $e;
        }
    }

    /**
     * Record rider payment
     */
    public function recordRiderPayment(int $riderId, float $amount, string $orderId, array $metadata = []): void
    {
        try {
            DB::beginTransaction();

            // Get accounts
            $riderLedger = LedgerAccount::where('user_id', $riderId)
                ->where('classification', 'asset')
                ->firstOrFail();

            $riderPayableAccount = LedgerAccount::where('code', '2010') // Rider Payables
                ->whereNull('user_id')
                ->firstOrFail();

            $riderExpenseAccount = LedgerAccount::where('code', '5020') // Rider Service Cost
                ->whereNull('user_id')
                ->firstOrFail();

            // Create transaction
            $transaction = Transaction::create([
                'id' => (string) Str::ulid(),
                'reference_id' => $orderId,
                'amount' => $amount,
                'type' => TransactionType::WITHDRAWAL,
                'status' => TransactionStatus::COMPLETED,
                'metadata' => json_encode($metadata)
            ]);

            // Create journal entry
            $journalEntry = $transaction->journalEntries()->create([
                'id' => (string) Str::ulid(),
                'description' => "Rider payment - Order #{$orderId}",
                'posted_at' => now()
            ]);

            // 1. Debit rider wallet (asset increases for rider)
            JournalLine::create([
                'id' => (string) Str::ulid(),
                'journal_entry_id' => $journalEntry->id,
                'ledger_account_id' => $riderLedger->id,
                'debit' => $amount,
                'credit' => 0,
                'currency' => 'KES'
            ]);

            // 2. Credit rider payable (liability decreases)
            JournalLine::create([
                'id' => (string) Str::ulid(),
                'journal_entry_id' => $journalEntry->id,
                'ledger_account_id' => $riderPayableAccount->id,
                'debit' => 0,
                'credit' => $amount,
                'currency' => 'KES'
            ]);

            // 3. Debit rider expense (cost recognized)
            JournalLine::create([
                'id' => (string) Str::ulid(),
                'journal_entry_id' => $journalEntry->id,
                'ledger_account_id' => $riderExpenseAccount->id,
                'debit' => $amount,
                'credit' => 0,
                'currency' => 'KES'
            ]);

            DB::commit();

            Log::info('Rider payment recorded', [
                'rider_id' => $riderId,
                'amount' => $amount,
                'order_id' => $orderId,
                'transaction_id' => $transaction->id
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to record rider payment', [
                'error' => $e->getMessage(),
                'rider_id' => $riderId,
                'order_id' => $orderId
            ]);

            throw $e;
        }
    }

    /**
     * Release funds from escrow after successful delivery
     */
    public function releaseEscrowFunds(string $orderId, float $amount): void
    {
        try {
            DB::beginTransaction();

            $escrowAccount = LedgerAccount::where('code', '2020') // Customer Order Escrow
                ->whereNull('user_id')
                ->firstOrFail();

            $deliveryRevenueAccount = LedgerAccount::where('code', '4010') // Delivery Service Revenue
                ->whereNull('user_id')
                ->firstOrFail();

            // Create transaction
            $transaction = Transaction::create([
                'id' => (string) Str::ulid(),
                'reference_id' => $orderId,
                'amount' =>  $amount,
                'type' => TransactionType::TRANSFER,
                'status' => TransactionStatus::COMPLETED,
                'metadata' => json_encode(['action' => 'release_escrow'])
            ]);

            // Create journal entry
            $journalEntry = $transaction->journalEntries()->create([
                'id' => (string) Str::ulid(),
                'description' => "Release escrow funds - Order #{$orderId}",
                'posted_at' => now()
            ]);

            // 1. Credit escrow account (liability decreases - money released)
            JournalLine::create([
                'id' => (string) Str::ulid(),
                'journal_entry_id' => $journalEntry->id,
                'ledger_account_id' => $escrowAccount->id,
                'debit' => 0,
                'credit' => $amount,
                'currency' => 'KES'
            ]);

            // 2. Debit revenue account (revenue recognized)
            JournalLine::create([
                'id' => (string) Str::ulid(),
                'journal_entry_id' => $journalEntry->id,
                'ledger_account_id' => $deliveryRevenueAccount->id,
                'debit' => $amount,
                'credit' => 0,
                'currency' => 'KES'
            ]);

            DB::commit();

            Log::info('Escrow funds released', [
                'order_id' => $orderId,
                'amount' => $amount,
                'transaction_id' => $transaction->id
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to release escrow funds', [
                'error' => $e->getMessage(),
                'order_id' => $orderId
            ]);

            throw $e;
        }
    }

    /**
     * Record failed payment
     */
    public function recordFailedPayment(array $stkCallback): void
    {
        $userId = Redis::get($stkCallback['CheckoutRequestID'] ?? '');

        if ($userId) {
            $errorMessage = $stkCallback['ResultDesc'] ?? 'Transaction cancelled';
            MpesaTransactionUpdated::broadcast($userId, 'Payment failed: ' . $errorMessage);
            Redis::del($stkCallback['CheckoutRequestID']);
        }

        Log::info('Failed payment recorded', [
            'user_id' => $userId,
            'result_desc' => $stkCallback['ResultDesc'] ?? null,
            'result_code' => $stkCallback['ResultCode'] ?? null
        ]);
    }

    /**
     * Calculate C2B Paybill charges (M-Pesa Paybill fees)
     */
    private function calculateC2BPaybillCharge(float $amount): float
    {
        $amount = ceil($amount);

        // M-Pesa Paybill charges as per Safaricom rates
        $charges = [
            100 => 0.00,
            500 => 5.00,
            1000 => 23.00,
            1500 => 28.00,
            2500 => 33.00,
            3500 => 48.00,
            5000 => 34.00,
            7500 => 54.00,
            10000 => 64.00,
            15000 => 78.00,
            20000 => 93.00,
            30000 => 98.00,
            45000 => 103.00,
            100000 => 105.00,
            150000 => 106.00,
            250000 => 108.00,
        ];

        $applicableCharge = 108.00; // Default max charge

        foreach ($charges as $threshold => $charge) {
            if ($amount <= $threshold) {
                $applicableCharge = $charge;
                break;
            }
        }

        return $applicableCharge;
    }


    /**
     * Get wallet balance for a user
     */
    public function getWalletBalance(int $userId): float
    {
        $userLedger = LedgerAccount::where('user_id', $userId)
            ->where('classification', 'asset')
            ->first();

        if (!$userLedger) {
            return 0.00;
        }

        return JournalLine::where('ledger_account_id', $userLedger->id)
            ->sum(DB::raw('debit - credit'));
    }
}
