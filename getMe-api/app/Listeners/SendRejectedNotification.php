<?php

namespace App\Listeners;

use App\Events\RiderRejected;
use App\Models\Rider;
use App\Models\User;
use App\Notifications\RiderRejectedNotification;

class SendRejectedNotification
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(RiderRejected $event): void
    {
        // logic to send notification to rider about rejection.
        $rider = User::find($event->riderId);
        $rider->notify(new RiderRejectedNotification);
    }
}
