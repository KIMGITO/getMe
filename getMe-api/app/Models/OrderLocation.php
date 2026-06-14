<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['lat', 'lng', 'description'])]

class OrderLocation extends Model
{
    use HasUlids;
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
