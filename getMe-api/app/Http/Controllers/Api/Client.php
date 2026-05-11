<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Http\Request;
#[Fillable([
    'user_id',

    // Identity & Visuals
    'profile_photo_path',
    'is_verified',

    // Location & Addresses
    'home_address',
    'work_address',
    'default_landmark',
    'latitude',
    'longitude',
    'city',

    // Preferences & Localization
    'preferred_payment_method',
    'notifications_enabled',
    'language',

    // Safety & Emergency
    'emergency_contact_name',
    'emergency_contact_phone',

    // Status, Analytics & Reputation
    'rating',
    'total_spent',
    'total_requests',
    'is_blocked',
    'block_reason',
    'last_active_at'
])]
class Client extends Controller
{
    
    protected $table = 'client_profiles';

    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'is_verified' => 'boolean',
        'is_blocked' => 'boolean',
        'notifications_enabled' => 'boolean',
        'total_requests' => 'integer',
        'rating' => 'float',
        'total_spent' => 'float',
        'last_active_at' => 'datetime',
    ];

    
    
}
