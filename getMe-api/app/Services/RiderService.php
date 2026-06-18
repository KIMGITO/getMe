<?php

namespace App\Services;

use App\Events\RiderRejected;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class RiderService
{
    protected $rejectedKey = 'rejected.riders.client:';

    /**
     * Create a new class instance.;
     */
    public function __construct()
    {
        //
    }

    public function dashboard(User $user){
        $user = $user->load(['rider', 'rider.location']);
        $rider = $user->rider;


        $location = $rider ? $rider->getLocationData() : null;

        $data = [
        'name'        => $user->name,
        'phone'       => $user->phone ?? '',
        'email'       => $user->email ?? '',
        'role'        => $user->role,
        'is_online'   => $rider?->is_active ?? false,
        'is_verified' => $rider?->is_verified ?? false,
        'position' => [
            'lat'     => $location['lat'] ?? 0,
            'lng'     => $location['lng'] ?? 0,
            'heading' => $rider?->location?->heading ?? 0, 
            'speed'   => $rider?->location?->speed ?? 0, 
        ],
        'vehicle' => [
            'type'         => $rider?->vehicle_type ?? 'Bike',
            'model'        => $rider?->vehicle_model ?? '',
            'plate_number' => $rider?->vehicle_plate_number ?? '',
        ],
        
            'is_idle' => $rider?->isIdle ?? true
        ];
        Log::alert('Rider dashboard', [
            'rider' => $data
        ]);
    }

    public function isRiderProfileSet(User $user)
    {
        return Rider::where('user_id', $user->id)->exists();
    }

    public function addRejectedRider(string $clientId, string $riderId)
    {
        Redis::sAdd($this->rejectedKey.$clientId, $riderId);
        // fire event to notify rider of rejection
        RiderRejected::dispatch($riderId);

        return $this->getRejectedRiders($clientId);
    }

    public function getRejectedRiders(string $clientId)
    {
        return Redis::sismember($this->rejectedKey.$clientId);
    }

    public function clearRejectedRiders(string $clientId)
    {
        Redis::del($this->rejectedKey.$clientId);
    }
}
