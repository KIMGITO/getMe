<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rider;
use App\Services\GeoService;
use App\Services\RiderLocationService;
use Exception;
use Illuminate\Http\Request;

class RiderLocationController extends Controller
{
    // update rider locations
    public function update(Request $request, RiderLocationService $riderLocationService)
    {
        $user = $request->user();

        $isProfileUpdated = Rider::assignable()->where('user_id', $user->id)->exists();

        if (! $isProfileUpdated) {
            throw new Exception('Can not assign task: rider, profile details not provided.');
        }

        $validated = $request->validate([
            'lat' => ['required', 'numeric'],
            'lng' => ['required', 'numeric'],
        ]);

        return $riderLocationService->updateLocation($validated['lat'], $validated['lng'], $user);
    }

    // nearby  and allocate the nearest
    public function nearby(Request $request, GeoService $geo)
    {
        $client = $request->user();

        if ($client->role != 'client') {
            throw new Exception('Unsupported action');
        }

        $validated = $request->validate([
            'lat' => ['required', 'numeric'],
            'lng' => ['required', 'numeric'],
        ]);

        $nearby = [];
        $radius = 2;
        $maxRadius = 10;

        while (empty($nearby) && $radius <= $maxRadius) {
            $nearby = $geo->nearby(
                $validated['lat'],
                $validated['lng'],
                $radius
            );

            $radius++;
        }

        if (empty($nearby)) {
            return response()->json([
                'success' => false,
                'message' => 'No rider nearby the market',
            ]);
        }

        $riders = collect($nearby)
            ->map(function ($rider) {
                return [
                    'id' => $rider[0],
                    'distance' => (float) $rider[1],
                    'longitude' => $rider[2][0],
                    'latitude' => $rider[2][1],
                ];
            })
            ->sortBy('distance')
            ->values()
            ->toArray();

        $assignedRider = $geo->dispatch($riders, $client);

        if (! $assignedRider) {
            return response()->json([
                'success' => false,
                'message' => 'No available rider could be assigned',
            ]);
        }

        $riderWithLocation = $assignedRider?->load('location');
        $location = $riderWithLocation->location;

        // remove the rider from the keys and assign new distance
        $geo->remove($assignedRider->id);

        $geo->deliveryLocation(
            [
                'lat' => $location->latitude,
                'lng' => $location->longitude,
                'id' => $assignedRider->id,
            ],
            [
                'lat' => -1.276389,
                'lng' => 36.827223,
                'id' => $client->id,
            ]
        );

        $deliveryDistance = $geo->distance($assignedRider->id, $client->id);

        if ($deliveryDistance < 1) {
            $distanceText = round($deliveryDistance * 1000, 0) . ' m';
        } else {
            $distanceText = round($deliveryDistance, 1) . ' km';
        }

        return response()->json([
            'success' => true,
            'message' => 'Assigned Rider',
            'data' => [
                'id' => $assignedRider->id,
                'name' => $assignedRider->name,
                'phone' => $assignedRider->phone ?? '',
                'vehicle' => $assignedRider->rider->vehicle_type . ' ' . $assignedRider->rider->vehicle_model,
                'vehicle_number' => $assignedRider->rider->vehicle_plate_number,
                'distance' => $distanceText,
            ],
        ]);
    }
}
