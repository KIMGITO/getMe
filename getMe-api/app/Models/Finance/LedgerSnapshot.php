<?php

namespace App\Models\Finance;

use App\Models\Finance\LedgerAccount;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['ledger_account_id', 'closing_balance', 'snapshot_date'])]
class LedgerSnapshot extends Model
{
    use HasUlids;

    public function ledgerAccount():BelongsTo{
        return $this->belongsTo(LedgerAccount::class);
    }
}
