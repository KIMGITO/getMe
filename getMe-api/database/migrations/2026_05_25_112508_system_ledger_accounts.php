<?php

use App\Models\Finance\LedgerAccount;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Revenue Accounts
        LedgerAccount::create([
            'code' => LedgerAccount::CODE_REVENUE_DELIVERY,
            'name' => 'Delivery Service Revenue',
            'user_id' => null,
            'classification' => 'revenue',
            'normal_balance' => 'credit'
        ]);

        LedgerAccount::create([
            'code' => LedgerAccount::CODE_REVENUE_COMMISSION,
            'name' => 'Order Processing Commission',
            'user_id' => null,
            'classification' => 'revenue',
            'normal_balance' => 'credit'
        ]);

        // Expense Accounts
        LedgerAccount::create([
            'code' => LedgerAccount::CODE_EXPENSE_MPESA_FEE,
            'name' => 'M-Pesa Transaction Fees',
            'user_id' => null,
            'classification' => 'expense',
            'normal_balance' => 'debit'
        ]);

        // Asset Accounts
        LedgerAccount::create([
            'code' => LedgerAccount::CODE_ASSET_MPESA,
            'name' => 'M-Pesa Settlement Account',
            'user_id' => null,
            'classification' => 'asset',
            'normal_balance' => 'debit'
        ]);

        // Liability Accounts
        LedgerAccount::create([
            'code' => LedgerAccount::CODE_LIABILITY_RIDER_PAYABLE,
            'name' => 'Rider Payables',
            'user_id' => null,
            'classification' => 'liability',
            'normal_balance' => 'credit'
        ]);

        LedgerAccount::create([
            'code' => LedgerAccount::CODE_LIABILITY_CUSTOMER_WALLET,
            'name' => 'Customer Order Escrow',
            'user_id' => null,
            'classification' => 'liability',
            'normal_balance' => 'credit'
        ]);
    }

    public function down(): void
    {
        LedgerAccount::whereIn('code', [
            LedgerAccount::CODE_REVENUE_DELIVERY,
            LedgerAccount::CODE_REVENUE_COMMISSION,
            LedgerAccount::CODE_EXPENSE_MPESA_FEE,
            LedgerAccount::CODE_ASSET_MPESA,
            LedgerAccount::CODE_LIABILITY_RIDER_PAYABLE,
            LedgerAccount::CODE_LIABILITY_CUSTOMER_ESCROW,
        ])->delete();
    }
};
