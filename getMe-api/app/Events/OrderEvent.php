<?php

namespace App\Events;

use App\Enums\OrderEventActions;
use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;


    /**
     * @param  OrderEventActions  $action  One of the ACTION_* constants
     * @param  Order  $order  The order object
     * @param  array  $data  Additional data
     * @param  string|null  $targetChannel  Specific channel (e.g., 'client.123', 'rider.456')
     */
    public function __construct(
        public OrderEventActions $action,
        public Order $order,
        public array $data = [],
        public ?string $targetChannel = null
    ) {}

    public function broadcastOn(): array
    {
        if ($this->targetChannel) {
            return [new PrivateChannel($this->targetChannel)];
        }

        // determine channels based on action
        $channels = [];

        switch ($this->action) {
            case OrderEventActions::ACTION_RIDER_SELECTED:
                // Send to both client and selected rider
                $channels[] = new PrivateChannel("client.{$this->order->client_id}");
                if ($this->order->rider_id) {
                    $channels[] = new PrivateChannel("rider.{$this->order->rider_id}");
                }
                break;

            case OrderEventActions::ACTION_RIDER_CONFIRMED:
                // Send to both client and rider
                $channels[] = new PrivateChannel("client.{$this->order->client_id}");
                if ($this->order->rider_id) {
                    $channels[] = new PrivateChannel("rider.{$this->order->rider_id}");
                }
                break;

            case OrderEventActions::ACTION_RIDER_REJECTED:
                // Send to rider who was rejected
                if ($this->data['rider_id'] ?? false) {
                    $channels[] = new PrivateChannel("rider.{$this->data['rider_id']}");
                }
                // Also notify client
                $channels[] = new PrivateChannel("client.{$this->order->client_id}");
                break;

            case OrderEventActions::ACTION_NO_RIDERS_AVAILABLE:
            case OrderEventActions::ACTION_RIDER_SEARCHING:
            case OrderEventActions::ACTION_RIDER_SEARCHING_AGAIN:
                // Send only to client
                $channels[] = new PrivateChannel("client.{$this->order->client_id}");
                break;
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'order.event';
    }

    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'order_status' => $this->order->order_status->value ?? $this->order->order_status,
            'data' => $this->data,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
