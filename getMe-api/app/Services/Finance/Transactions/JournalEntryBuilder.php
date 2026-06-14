<?php
// app/Services/Finance/Transactions/JournalEntryBuilder.php

namespace App\Services\Finance\Transactions;

use App\Models\Finance\JournalEntry;
use App\Models\Finance\JournalLine;
use App\Models\Finance\LedgerAccount;
use App\Services\Finance\DTOs\TransactionData;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class JournalEntryBuilder
{
    private array $lines = [];

    public function __construct(
        private readonly TransactionData $data,
        private readonly Collection $accounts
    ) {}

    /**
     * Build journal entry for customer deposit
     */
    public function buildDeposit(): self
    {
        $userAccount = $this->getUserAccount();
        $revenueAccount = $this->getSystemAccount('REVENUE:MPESA:PAYBILL');
        $settlementAccount = $this->getSystemAccount('ASSET:MPESA:SETTLEMENT');

        $netAmount = $this->data->getNetAmount();

        // Line 1: User receives money
        $this->addLine(
            accountId: $userAccount->id,
            debit: $netAmount,
            credit: 0,
            description: 'Customer deposit - net amount'
        );

        // Line 2: Company records revenue
        $this->addLine(
            accountId: $revenueAccount->id,
            debit: 0,
            credit: $this->data->amount,
            description: 'M-Pesa payment revenue'
        );

        // Line 3: Record M-Pesa fee expense
        if ($this->data->fee > 0) {
            $feeAccount = $this->getSystemAccount('EXPENSE:MPESA:FEE');
            $this->addLine(
                accountId: $feeAccount->id,
                debit: $this->data->fee,
                credit: 0,
                description: 'M-Pesa transaction fee'
            );
        }

        // Line 4: Money moves to settlement account
        $this->addLine(
            accountId: $settlementAccount->id,
            debit: 0,
            credit: $this->data->amount,
            description: 'Funds to M-Pesa settlement'
        );

        return $this;
    }

    /**
     * Build journal entry for withdrawal
     */
    public function buildWithdrawal(): self
    {
        $userAccount = $this->getUserAccount();
        $settlementAccount = $this->getSystemAccount('ASSET:MPESA:SETTLEMENT');
        $feeAccount = $this->getSystemAccount('EXPENSE:MPESA:FEE');

        $netAmount = $this->data->getNetAmount();

        // Line 1: User loses money
        $this->addLine(
            accountId: $userAccount->id,
            debit: 0,
            credit: $this->data->amount,
            description: 'Withdrawal from wallet'
        );

        // Line 2: Platform pays M-Pesa fee
        if ($this->data->fee > 0) {
            $this->addLine(
                accountId: $feeAccount->id,
                debit: $this->data->fee,
                credit: 0,
                description: 'Withdrawal fee expense'
            );
        }

        // Line 3: Money leaves settlement account
        $this->addLine(
            accountId: $settlementAccount->id,
            debit: 0,
            credit: $this->data->amount + $this->data->fee,
            description: 'Funds from M-Pesa settlement'
        );

        return $this;
    }

    /**
     * Build journal entry for order payment (customer to escrow)
     */
    public function buildOrderPayment(): self
    {
        $userAccount = $this->getUserAccount();
        $escrowAccount = $this->getSystemAccount('LIABILITY:CUSTOMER:ESCROW');
        $feeAccount = $this->getSystemAccount('EXPENSE:MPESA:FEE');


        $this->addLine(
            accountId: $userAccount->id,
            debit: 0,
            credit: $this->data->amount,
            description: 'Order payment from customer'
        );

        if ($this->data->fee > 0) {
            $this->addLine(
                accountId: $feeAccount->id,
                debit: $this->data->fee,
                credit: 0,
                description: 'Order payment fee'
            );
        }

        $this->addLine(
            accountId: $escrowAccount->id,
            debit: $this->data->amount,
            credit: 0,
            description: 'Funds held in escrow'
        );

        return $this;
    }

    /**
     * Build journal entry for rider payment
     */
    public function buildRiderPayment(): self
    {
        $riderAccount = $this->getUserAccount();
        $riderPayableAccount = $this->getSystemAccount('LIABILITY:RIDER:PAYABLE');
        $deliveryRevenueAccount = $this->getSystemAccount('REVENUE:DELIVERY');

        $this->addLine(
            accountId: $riderAccount->id,
            debit: 0,
            credit: $this->data->amount,
            description: 'Rider payment due'
        );

        $this->addLine(
            accountId: $riderPayableAccount->id,
            debit: $this->data->amount,
            credit: 0,
            description: 'Rider payable recorded'
        );

        $this->addLine(
            accountId: $deliveryRevenueAccount->id,
            debit: 0,
            credit: $this->data->amount,
            description: 'Delivery revenue earned'
        );

        return $this;
    }

    private function addLine(string $accountId, float $debit, float $credit, string $description): void
    {
        $this->lines[] = [
            'id' => (string) Str::ulid(),
            'ledger_account_id' => $accountId,
            'debit' => $debit,
            'credit' => $credit,
            'currency' => 'KES',
            'description' => $description
        ];
    }

    private function getUserAccount(): LedgerAccount
    {
        $account = $this->accounts->first(fn($acc) => $acc->user_id === $this->data->userId);
        if (!$account) {
            \Log::info('User ledger account not found', ['user_id' => $this->data->userId]);
            throw new \Exception("User ledger account not found");
        }
        return $account;
    }

    private function getSystemAccount(string $code): LedgerAccount
    {
        $account = $this->accounts->get($code);
        if (!$account) {
            throw new \Exception("System account not found: {$code}");
        }
        return $account;
    }

    public function getLines(): array
    {
        return $this->lines;
    }

    public function getTotalDebit(): float
    {
        return array_sum(array_column($this->lines, 'debit'));
    }

    public function getTotalCredit(): float
    {
        return array_sum(array_column($this->lines, 'credit'));
    }
}
