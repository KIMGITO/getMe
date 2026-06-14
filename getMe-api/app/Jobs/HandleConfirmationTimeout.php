<?php

namespace App\Jobs;

use App\Services\AutoRiderSelectionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class HandleConfirmationTimeout implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;
    
    public int $orderId;
    
    public function __construct(int $orderId)
    {
        $this->orderId = $orderId;
    }
    
    public function handle(AutoRiderSelectionService $service)
    {
        $service->handleConfirmationTimeout($this->orderId);
    }
}