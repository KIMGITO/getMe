<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class MpesaTransactionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public string $userId,
        public string $message,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        Log::info('Broadcasting M-Pesa transaction update', [
            'user_id' => $this->userId,
            'message' => $this->message
        ]);

        return [
            new PrivateChannel('mpesa.transaction.status.changed.user.' . $this->userId),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'message' => $this->message,
            'user_id' => $this->userId,
            'timestamp' => now()->toIso8601String()
        ];
    }

    // /**
    //  * The event's broadcast name.
    //  */
    public function broadcastAs(): string
    {
        return 'mpesa.transaction.updated';
    }
}
