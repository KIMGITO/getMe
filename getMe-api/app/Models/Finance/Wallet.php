<?php

namespace App\Models\Finance;

use App\Models\Finance\LedgerAccount;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['user_id', 'ledger_account_id', 'cached_balance', 'cached_held_balance', 'currency', 'version'])]
class Wallet extends Model
{
    use HasUlids;

    public function ledgerAccount(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class);
    }

    public function  user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
