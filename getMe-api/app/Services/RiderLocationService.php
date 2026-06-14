<?php

namespace App\Services;

use App\Models\RiderLocation;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RiderLocationService
{
    public function __construct(
        protected GeoService $geo
    ) {}

    public function updateLocation(float $lat, float $lng, User $user): array
    {
        // Ensure only riders can update location
        if ($user->role !== 'rider') {
            abort(403, 'Unauthorized');
        }

        // to avoid too much updates on the db
        $location = RiderLocation::where('rider_id', $user->id)->first();

        if (
            ! $location ||
            $location->updated_at->diffInMinutes(now()) >= 2
        ) {

            RiderLocation::updateOrCreate(
                ['rider_id' => $user->id],
                [
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'last_seen_at' => now(),
                ]
            );
        }

        $this->geo->updateLocation($user->id, $lat, $lng);

        return [
            'success' => true,
            'message' => 'Location updated',
            'latitude' => $lat,
            'longitude' => $lng,
        ];
    }

   
}
