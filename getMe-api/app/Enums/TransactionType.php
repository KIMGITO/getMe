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
}
