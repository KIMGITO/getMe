<?php

namespace App\Services\Finance\Accounting;

use App\Enums\TransactionStatus;
use App\Models\Finance\JournalEntry;
use App\Models\Finance\JournalLine;
use App\Models\Finance\Transaction;
use App\Services\Finance\Accounting\DoubleEntryValidator;
use App\Services\Finance\DTOs\TransactionData;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LedgerPoster
{
    public function __construct(
        private readonly DoubleEntryValidator $validator
    ) {}
    
    /**
     * Post a complete transaction with journal entries
     */
    public function post(TransactionData $data, array $journalLines): Transaction
    {
        return DB::transaction(function () use ($data, $journalLines) {
            $transaction = $this->createTransaction($data);
            
            if ($data->gateway) {
                $this->createPaymentIntent($transaction, $data);
            }
            
            // 3. Create journal entry
            $journalEntry = $this->createJournalEntry($transaction, $data);
            
            // 4. Create journal lines
            foreach ($journalLines as $line) {
                $line['journal_entry_id'] = $journalEntry->id;
                JournalLine::create($line);
            }
            
            // 5. Validate before committing
            $this->validator->validate($journalLines);
            
            return $transaction;
        });
    }
    
    private function createTransaction(TransactionData $data): Transaction
    {
        return Transaction::create([
            'reference_id' => $data->referenceId,
            'type' => $data->type,
            'amount' => $data->amount,
            'status' => $data->status,
            'metadata' => json_encode($data->metadata)
        ]);
    }
    
    private function createPaymentIntent(Transaction $transaction, TransactionData $data): void
    {
        $transaction->paymentIntents()->create([
            'gateway' => $data->gateway,
            'external_amount' => $data->amount,
            'gateway_fee' => $data->fee,
            'net_amount' => $data->getNetAmount(),
            'status' => $data->status === TransactionStatus::COMPLETED ? 'SUCCESS' : 'FAILED',
            'gateway_response' => json_encode($data->metadata),
            'gateway_ref' => $data->referenceId
        ]);
    }
    
    private function createJournalEntry(Transaction $transaction, TransactionData $data): JournalEntry
    {
        return $transaction->journalEntries()->create([
            'description' => $data->description ?? "Transaction for user {$data->userId}",
            'posted_at' => now()
        ]);
    }
}