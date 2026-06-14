<?php

namespace App\Enums;

enum PaymentIntentStatus: string
{
    case PENDING = 'pending';
    case SUCCESS = 'success';
    case FAILED = 'failed';
}
