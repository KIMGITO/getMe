<?php

namespace App\Enums;

enum TransactionStatus: string
{
    case PENDING = 'pending';
    case RPOCESSING = 'processing';
    case COMPLETED = 'complete';
    case FAILED = 'failed';
    case TIMEOUT = 'timeout';
    case REVERSED = 'reversed';
    case REFUNDED = 'refunded';
    case SETTLED = 'settled';
    case DISPUTED = 'disputed';
}
