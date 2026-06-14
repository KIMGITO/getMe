<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'client_id',
    'title',
    'status',
    'submitted_at',
    'preferred_pickup_start_time',
    'total_estimated_cost',
    'total_actual_cost',
    'delivery_address_id',  
    'rider_id',
    'note_for_rider',
])]
class ShoppingList extends Model
{
    use HasUlids;

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ShoppingItem::class, 'shopping_list_id');
    }

    public function order(): HasOne
    {
        return $this->hasOne(Order::class, 'shopping_list_id');
    }
}
