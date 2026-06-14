<?php

namespace App\Models\Finance;

use App\Models\Finance\Transaction;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['transaction_id', 'gateway', 'gateway_ref', 'external_amount', 'gateway_fee', 'net_amount',  'status', 'gateway_response'])]
class PaymentIntent extends Model
{
    use HasUlids;

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'transaction_id', 'id');
    }
}
