<?php

namespace App\Models\Finance;

use App\Models\Finance\JournalEntry;
use App\Models\Finance\PaymentIntent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['reference_id', 'type', 'status', 'metadata'])]
class Transaction extends Model
{
    use HasUlids;
    protected $casts = [
        'metadata' => 'array',
    ];


    public function journalEntries(): HasMany
    {
        return $this->hasMany(JournalEntry::class);
    }
    public function paymentIntents(): HasMany
    {
        return $this->hasMany(PaymentIntent::class);
    }
}
