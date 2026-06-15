<?php

namespace App\Enums;

enum TransactionType: string
{
    case DEPOSIT = 'deposit';
    case WITHDRAWAL = 'withdrawal';
    case TRANSFER = 'transfer';
    case PAYMENT = 'payment';
    case REVERSAL = 'reversal';
    case CHARGEDBACK = 'chargedback';

    public function referenceCode(): string
    {
        return match($this) {
            self::DEPOSIT => 'D',
            self::WITHDRAWAL => 'W',
            self::TRANSFER => 'T',
            self::PAYMENT => 'P',
            self::REVERSAL => 'R',
            self::CHARGEDBACK => 'B', 
        };
    }

    public function label(): string
    {
        return match($this) {
            self::DEPOSIT => 'Account Deposit',
            self::WITHDRAWAL => 'Funds Withdrawal',
            self::TRANSFER => 'Wallet Transfer',
            self::PAYMENT => 'Service Payment',
            self::REVERSAL => 'Transaction Reversal',
            self::CHARGEDBACK => 'Disputed Chargeback',
        };
    }
}
