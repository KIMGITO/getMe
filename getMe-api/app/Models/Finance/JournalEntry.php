<?php

namespace App\Models\Finance;

use App\Models\Finance\JournalLine;
use App\Models\Finance\Transaction;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['transaction_id', 'description', 'posted_at'])]
class JournalEntry extends Model
{
    use HasUlids;
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function journalLines(): HasMany
    {
        return $this->hasMany(JournalLine::class);
    }
}
