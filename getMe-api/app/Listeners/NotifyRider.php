<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Jobs\DispatchOrderJob;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;

class NotifyRider implements ShouldQueueAfterCommit
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
    public function handle(OrderPlaced $event): void
    {
        // dispatch a job
        DispatchOrderJob::dispatch($event->order, $event->rejectedRiders);
    }
}
