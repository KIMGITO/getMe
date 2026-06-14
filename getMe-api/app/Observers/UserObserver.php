<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Support\Str;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        try {
            // Create ledger account for the user
            $ledgerAccount = $user->ledgerAccount()->create([
                'id' => (string) Str::ulid(),
                'name' => $user->name . "'s Wallet",
                'code' => 'USER_LEDGER:' . $user->id,
                'user_id' => $user->id,
                'classification' => 'asset',
                'normal_balance' => 'debit',
                'currency' => 'KES'
            ]);
            
            // Create wallet linked to the ledger account
            $user->wallet()->create([
                'id' => (string) Str::ulid(),
                'ledger_account_id' => $ledgerAccount->id,
                'cached_balance' => 0,
                'cached_held_balance' => 0,
                'currency' => 'KES',
                'version' => 1
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Failed to create wallet for user', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // Optional: Update ledger account name if user name changes
        if ($user->wasChanged('name')) {
            $ledgerAccount = $user->ledgerAccount;
            if ($ledgerAccount) {
                $ledgerAccount->update([
                    'name' => $user->name . "'s Wallet"
                ]);
            }
        }
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        // Delete wallet and ledger account when user is deleted
        $wallet = $user->wallet;
        if ($wallet) {
            $ledgerAccount = $user->ledgerAccount;
            $wallet->delete();
            if ($ledgerAccount) {
                $ledgerAccount->delete();
            }
        }
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        // Optional: Restore wallet and ledger account
        // You might want to implement this if using soft deletes
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        // Force delete wallet and ledger account
        $wallet = $user->wallet()->withTrashed()->first();
        if ($wallet) {
            $ledgerAccount = $user->ledgerAccount()->withTrashed()->first();
            $wallet->forceDelete();
            if ($ledgerAccount) {
                $ledgerAccount->forceDelete();
            }
        }
    }
}