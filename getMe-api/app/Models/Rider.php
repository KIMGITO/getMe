<?php

namespace App\Models;

use App\Enums\RiderActivityStatus;
use App\Models\User;
use App\Services\GeoService;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

#[Fillable([
    'user_id',
    'id_number',
    'id_front_path',
    'id_back_path',
    'sacco_name',
    'sacco_membership_number',
    'vehicle_type',
    'vehicle_plate_number',
    'vehicle_model',
    'is_active',
    'is_suspended',
    'activity_status',
    'is_blacklisted',
    'suspension_reason',
    'is_verified',
    'is_waiting_verification',
    'current_order_id',
    'assigned_at'
])]

class Rider extends Model
{
    use HasUlids;

    protected $table = 'rider_profiles';

    protected $casts = [
        'id_number' => 'encrypted',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'is_waiting_verification' => 'boolean',
        'is_suspended' => 'boolean',
        'is_blacklisted' => 'boolean',
        'activity_status' => RiderActivityStatus::class,
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function location(){
        return $this->hasOne(RiderLocation::class, 'rider_id', 'user_id');
    }

    public function scopeIsAssignable($query)
    {
        return $query->where('is_verified', true)->where('is_active', true)-> where('is_suspended', false)->where('is_blacklisted', false);
    }

    

    public function getLocationData()
    {

        if (!$this->user_id) {
            return null;
        }

        return app(GeoService::class)->getRiderLocation($this->user_id);
    }

    // actions
    public function setIdle()
    {
        $geo = app(GeoService::class);
        $id = $this->user_id;
        $status =  RiderActivityStatus::STATUS_IDLE;
        $geo->setStatus($id, $status);
        $this->active_status =  $status;
    }


    public function setNotIdle()
    {
        $geo = app(GeoService::class);
        $id = $this->user_id;
        $status =  RiderActivityStatus::STATUS_BUSY;
        $geo->setStatus($id, $status);
        $this->active_status =  $status;
    }


    public function scopeIsIdle()
    {
        return app(GeoService::class)->getStatus($this->user_id) === RiderActivityStatus::STATUS_IDLE;
    }
}
