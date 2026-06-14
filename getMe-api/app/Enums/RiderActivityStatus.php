<?php

namespace App\Enums;

enum RiderActivityStatus: string
{
    case STATUS_IDLE = 'idle';
    case STATUS_BUSY = 'busy';
    case STATUS_OFFLINE = 'offline';
    case STATUS_SELECTED = 'selected';
    case STATUS_ON_DELIVERY = 'on_delivery';
    case STATUS_BREAK = 'on_break';
    case STATUS_BATTERY_LOW = 'battery_low';
}
