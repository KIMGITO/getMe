<?php

namespace App\Services;

use App\Events\RiderFoundEvent;
use App\Models\Order;
use App\Models\OrderLocation;

class DispatchService
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        protected GeoService $riderGeo
    ) {}

    public function dispatch(Order $order)
    {
        $source = OrderLocation::findOrFail($order->source_location);
        $destination = OrderLocation::findOrFail($order->delivery_location);

        // Get riders nearby the source.
        $riders = $this->findNearbyRiders($source->lat, $source->lng);
        if (empty($riders)) {
            return false;
        }

        foreach ($riders as $rider) {
            $riderId = $rider[0];
            event(new RiderFoundEvent($order, $riderId));
        }

        return true;

    }

    public function findNearbyRiders(float $lat, float $lng)
    {
        $radius = 10;
        $riders = [];

        while (empty($riders)) {
            $riders = $this->riderGeo->nearby($lat, $lng, $radius);
            $radius++;

            if ($radius > 100) {
                break;
            }
        }

        return $riders;
    }
}
