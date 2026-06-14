<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\AutoRiderSelectionService;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Delay;
use Illuminate\Queue\Attributes\Tries;

#[Tries(5)]
#[Backoff([5, 10, 20, 30])]

class AssignRiderJob implements ShouldQueue, ShouldBeUnique
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Order $order,
    ) {
        $this->afterCommit = true;
    }

    /**
     * The unique ID of the job.
     *
     * @return string
     */
    public function uniqueId()
    {
        return 'assign_rider_order_' . $this->order->id;
    }

    /**
     * Execute the job.
     */
    public function handle(AutoRiderSelectionService $autoSelectionService): void
    {
        $assigned = $autoSelectionService->autoSelectAndAssign($this->order);
        if (! $assigned) {
            $this->release(30);
            return;
        }
    }
}
