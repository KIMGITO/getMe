<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Redis;

class RiderGeoService
{
    private string $key = 'active:riders';

    private string $assignedKey = 'assigned:riders';

    public function updateLocation(string $riderId, float $lat, float $lng): void
    {
        Redis::geoadd(
            'active:riders',
            $lng,
            $lat,
            $riderId
        );
        // Optional: keep rider alive for realtime filtering
        // Redis::setex("rider:{$riderId}:online", 60, 1);
        // expires safe
    }

    // assigned riders.
    public function deliveryLocation(array $rider, array $client)
    {
        Redis::geoadd(
            $this->assignedKey,
            $rider['lng'],
            $rider['lat'],
            "rider:{$rider['id']}"
        );

        Redis::geoadd(
            $this->assignedKey,
            $client['lng'],
            $client['lat'],
            "client:{$client['id']}"
        );
    }

    // find nearby riders;
    public function nearby(float $lat, float $lng, int $radius = 50)
    {
        return Redis::georadius($this->key, $lng, $lat, $radius, 'km', ['WITHDIST', 'WITHCOORD']);
    }

    public function remove(string $riderId)
    {
        Redis::zRem($this->key, $riderId);
    }

    public function dispatch(array $riderData, User $client)
    {
        // send pope up to request rider to accept the delivery.

        // simulate matching by selecting the first  rider.

        $rider = $riderData[0] ?? null;
        $riderInfo = User::assignableRiders()->where('id', $rider['id'])->first();

        return $riderInfo;

    }

    public function distance(string $riderId, string $clientId)
    {
        return Redis::geodist(
            $this->assignedKey,
            "rider:{$riderId}",
            "client:{$clientId}",
            'km'
        );
    }
}
