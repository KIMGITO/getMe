<?php
// app/Services/Finance/Accounting/WalletUpdater.php

namespace App\Services\Finance\Accounting;

use App\Models\Finance\JournalLine;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class WalletUpdater
{
    public function updateWallet(string $userId, string $ledgerAccountId): void
    {
        $wallet = Wallet::where('user_id', $userId)->first();
        
        if (!$wallet) {
            return;
        }
        
        $newBalance = $this->calculateBalance($ledgerAccountId);
        
        $wallet->update([
            'cached_balance' => $newBalance,
            'version' => $wallet->version + 1
        ]);
    }
    
    private function calculateBalance(string $ledgerAccountId): float
    {
        return JournalLine::where('ledger_account_id', $ledgerAccountId)
            ->sum(DB::raw('debit - credit'));
    }
}