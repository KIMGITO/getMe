<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
#[Fillable(['rider_id','latitude','longitude','last_seen_at'])]

class RiderLocation extends Model
{
    protected $casts = ['last_seen_at' => 'datetime'];


    public function rider(){
        return $this->belongsTo(User::class ,'rider_id');
    }
}
