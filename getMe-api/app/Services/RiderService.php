<?php

namespace App\Services;

use App\Events\RiderRejected;
use App\Models\Rider;
use App\Models\User;
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
