<?php
// app/Services/Finance/Transactions/AccountResolver.php

namespace App\Services\Finance\Transactions;

use App\Models\Finance\LedgerAccount;
use App\Services\Finance\DTOs\TransactionData;
use Illuminate\Database\Eloquent\Collection;

class AccountResolver
{
    /**
     * Resolve all ledger accounts needed for a transaction
     */
    public function resolve(TransactionData $data): Collection
    {
        $accountCodes = $this->getRequiredAccountCodes($data);
        
        $accounts = LedgerAccount::whereIn('code', $accountCodes)
            ->orWhere(function($query) use ($data) {
                $query->where('user_id', $data->userId)
                      ->where('classification', 'asset');
            })
            ->get()
            ->keyBy('code');
        
        $this->validateAccounts($accounts, $accountCodes);
        
        return $accounts;
    }
    
    private function getRequiredAccountCodes(TransactionData $data): array
    {
        $codes = [
            'ASSET:MPESA:SETTLEMENT',
            'REVENUE:MPESA:PAYBILL',
        ];
        
        if ($data->fee > 0) {
            $codes[] = 'EXPENSE:MPESA:FEE';
        }
        
        return $codes;
    }
    
    private function validateAccounts(Collection $accounts, array $requiredCodes): void
    {
        $userAccount = $accounts->firstWhere('user_id', $accounts->first()?->user_id);
        
        if (!$userAccount) {
            throw new \Exception("User ledger account not found");
        }
        
        foreach ($requiredCodes as $code) {
            if (!$accounts->has($code)) {
                throw new \Exception("Required system account not found: {$code}");
            }
        }
    }
    
    public function getUserAccount(Collection $accounts, string $userId): LedgerAccount
    {
        return $accounts->first(fn($acc) => $acc->user_id === $userId);
    }
    
    public function getSystemAccount(Collection $accounts, string $code): LedgerAccount
    {
        return $accounts->get($code);
    }
}