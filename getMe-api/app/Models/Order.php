<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\HasOrderNumber;
use App\Models\OrderLocation;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

#[Fillable([
    'order_number',
    'shopping_list_id',
    'client_id',
    'rider_id',
    'source_location',
    'delivery_location',
    'order_status',
    'payment_method',
    'payment_status',
    'service_fee',
    'delivery_fee',
    'tip_amount',
    'items_cost',
    'total_charged',
    'rider_pickup_confirmed_at',
    'rider_delivered_at',
    'client_rating',
    'client_feedback',
    'rider_feedback',
    'rider_rating',
])]

class Order extends Model
{
    use HasOrderNumber, HasUlids;

    public function shoppingList(): BelongsTo
    {
        return $this->belongsTo(ShoppingList::class);
    }

    public function items(): HasManyThrough
    {
        return $this->hasManyThrough(ShoppingItem::class, ShoppingList::class,  'id', 'shopping_list_id','schopping_list_id', 'id');
    }

    public function marketLocation()
    {
        return $this->belongsTo(OrderLocation::class, 'source_location');
    }

    public function deliveryLocation()
    {
        return $this->belongsTo(OrderLocation::class, 'delivery_location');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes

    public function scopeIsAssignable()
    {
        return $this->order_status == OrderStatus::BIDDING;
    }

    public function markAsBidding(): void
    {
        $this->update(['order_status' => OrderStatus::BIDDING]);
    }

    public function markBidSelected(): void
    {
        $this->update(['order_status' => OrderStatus::BID_SELECTED]);
    }
}
