<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'name', 'default_landmark', 'city', 'is_default', 'street', 'estate', 'house_number', 'latitude', 'longitude'])]
class Address extends Model
{
    use HasUlids;

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function client()
    {
        return $this->belongsTo(User::class);
    }

    public function  user()
    {
        return $this->belongsTo(User::class);
    }
}
