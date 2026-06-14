<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'shopping_list_id',
    'shop',
    'location',
    'product_name',
    'quantity',
    'unit',
    'estimated_price_per_unit',
    'actual_price_per_unit',
    'is_picked',
    'substitute_allowed',
    'substitute_reason',
    'photo_url',
    'notes',
])]

class ShoppingItem extends Model
{
    use HasUlids;

    public function shoppingList(): BelongsTo
    {
        return $this->belongsTo(ShoppingList::class);
    }
}
