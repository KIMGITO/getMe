<?php

namespace App\Models\Finance;

use App\Models\Finance\JournalLine;
use App\Models\Finance\Wallet;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['code', 'name', 'classification', 'user_id', 'normal_balance'])]
class LedgerAccount extends Model
{

    use HasUlids;
    /*
    |--------------------------------------------------------------------------
    | ASSET ACCOUNTS (What the business owns)
    |--------------------------------------------------------------------------
    */

    // Physical cash held by company
    public const CODE_ASSET_CASH = '1010';

    // Money available in M-Pesa paybill/till
    public const CODE_ASSET_MPESA = '1020';

    // Company bank account balance
    public const CODE_ASSET_BANK = '1030';

    /*
    |--------------------------------------------------------------------------
    | LIABILITY ACCOUNTS (What the business owes)
    |--------------------------------------------------------------------------
    */

    // Money owed to riders after deliveries
    public const CODE_LIABILITY_RIDER_PAYABLE = '2010';

    // Customer wallet balances / escrowed money
    public const CODE_LIABILITY_CUSTOMER_WALLET = '2020';

    // Payments received before service completion
    public const CODE_LIABILITY_UNEARNED_REVENUE = '2030';

    /*
    |--------------------------------------------------------------------------
    | EQUITY ACCOUNTS (What the business owns /  ownership value)
    |--------------------------------------------------------------------------
    */

    // Capital invested by owners
    public const CODE_EQUITY_OWNERS = '3010';

    // Accumulated profits retained in business
    public const CODE_EQUITY_RETAINED_EARNINGS = '3020';


    /*
    |--------------------------------------------------------------------------
    | REVENUE ACCOUNTS (Business income)
    |--------------------------------------------------------------------------
    */

    // Delivery charges paid by customers
    public const CODE_REVENUE_DELIVERY = '4010';

    // Commission earned from vendors/riders
    public const CODE_REVENUE_COMMISSION = '4020';

    // Shopping or service fees charged
    public const CODE_REVENUE_SHOPPING = '4030';


    /*
    |--------------------------------------------------------------------------
    | EXPENSE ACCOUNTS (Business costs)
    |--------------------------------------------------------------------------
    */

    // M-Pesa transaction charges
    public const CODE_EXPENSE_MPESA_FEE = '5010';

    // Rider payments and transport costs
    public const CODE_EXPENSE_RIDER_COST = '5020';

    // Advertising and promotions
    public const CODE_EXPENSE_MARKETING = '5030';

    // General operational expenses
    public const CODE_EXPENSE_OPERATIONAL = '5040';


    /*
    |--------------------------------------------------------------------------
    | Helper methods
    |--------------------------------------------------------------------------
    */
    public static function getAssetAccounts(): array
    {
        return [
            self::CODE_ASSET_CASH,
            self::CODE_ASSET_MPESA,
            self::CODE_ASSET_BANK,
        ];
    }

    public static function getLiabilityAccounts(): array
    {
        return [
            self::CODE_LIABILITY_RIDER_PAYABLE,
            self::CODE_LIABILITY_CUSTOMER_ESCROW,
            self::CODE_LIABILITY_UNEARNED_REVENUE,
        ];
    }

    public static function getEquityAccounts(): array
    {
        return [
            self::CODE_EQUITY_OWNERS,
            self::CODE_EQUITY_RETAINED_EARNINGS,
        ];
    }

    public static function getRevenueAccounts(): array
    {
        return [
            self::CODE_REVENUE_DELIVERY,
            self::CODE_REVENUE_COMMISSION,
            self::CODE_REVENUE_SHOPPING,
        ];
    }

    public static function getExpenseAccounts(): array
    {
        return [
            self::CODE_EXPENSE_MPESA_FEE,
            self::CODE_EXPENSE_RIDER_COST,
            self::CODE_EXPENSE_MARKETING,
            self::CODE_EXPENSE_OPERATIONAL,
        ];
    }

    public function  user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function journalLines(): HasMany
    {
        return $this->hasMany(JournalLine::class);
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function ledgerSnapshots(): HasMany
    {
        return $this->hasMany(LedgerSnapshot::class);
    }
}
