<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id','profile_photo_path','is_verified','default_address_id','notification_enabled','preferred_payment_method','language', 'emergency_contact_name', 'emergency_contact_phone','total_requests','rating','total_spent','is_blocked','block_reason','last_active_at'])]
class Client extends Model
{
    use HasUlids;

    protected $table='client_profiles';

    protected $casts = [
        'last_active_at' => 'datetime',
        'is_verified' => 'boolean',
        'notification_enabled' => 'boolean',
        'is_blocked' => 'boolean'
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }


    public function orders(){
        return $this->user->orders();
    }

    public function hasBidedOrder(){
        return $this->orders()->where('order_status', OrderStatus::BID_SELECTED)->exists();
    }
    
}
