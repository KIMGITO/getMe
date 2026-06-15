<?php

namespace App\Models\Finance;

use App\Enums\TransactionType;
use App\Models\Finance\JournalEntry;
use App\Models\Finance\PaymentIntent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['reference_id','transaction_code', 'amount', 'type', 'status', 'metadata'])]
class Transaction extends Model
{
    use HasUlids;
    protected $casts = [
        'metadata' => 'array',
        'type' => TransactionType::class,
    ];


    public function journalEntries(): HasMany
    {
        return $this->hasMany(JournalEntry::class);
    }
    public function paymentIntents(): HasMany
    {
        return $this->hasMany(PaymentIntent::class);
    }

    protected static function booted(): void
    {
      static::creating(function (Transaction $transaction) {
            if (empty($transaction->transaction_code)) {
                $transaction->transaction_code = static::generateMpesaStyleReference($transaction->type);
            }
        });
    }

    private static function generateMpesaStyleReference(TransactionType $type): string
    {
        $yearCode = 'G'; 

        $month = (int) date('m');
        if ($month === 10) {
            $monthCode = 'O';
        } elseif ($month === 11) {
            $monthCode = 'N';
        } elseif ($month === 12) {
            $monthCode = 'D';
        } else {
            $monthCode = (string) $month;
        }

        $day = (int) date('d');
        if ($day <= 9) {
            $dayCode = (string) $day;
        } else {
            $dayCode = chr(64 + ($day - 9)); 
        }

        $typeCode = $type->referenceCode();

        $pool = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        
        $generateEntropy = function() use ($pool) {
            $entropy = '';
            for ($i = 0; $i < 6; $i++) {
                $entropy .= $pool[random_int(0, strlen($pool) - 1)];
            }
            return $entropy;
        };

        $randomEntropy = $generateEntropy();
        $reference = "{$yearCode}{$monthCode}{$dayCode}{$typeCode}{$randomEntropy}";

        while (static::where('transaction_code', $reference)->exists()) {
            $randomEntropy = $generateEntropy();
            $reference = "{$yearCode}{$monthCode}{$dayCode}{$typeCode}{$randomEntropy}";
        }

        return $reference;
    }
}
