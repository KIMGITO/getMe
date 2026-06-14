<?php

namespace App\Enums;

enum OrderEventActions: string
{
    case ACTION_RIDER_SELECTED = 'rider_selected';

    case ACTION_RIDER_CONFIRMED = 'rider_confirmed';

    case ACTION_RIDER_REJECTED = 'rider_rejected';

    case ACTION_NO_RIDERS_AVAILABLE = 'no_riders_available';

    case ACTION_RIDER_SEARCHING = 'searching_for_rider';

    case ACTION_RIDER_SEARCHING_AGAIN = 'searching_for_another_rider';
}
