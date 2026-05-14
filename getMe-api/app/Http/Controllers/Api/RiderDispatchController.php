<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RiderGeoService;
use Illuminate\Http\Request;

class RiderDispatchController extends Controller
{
    public function nearby(Request $request, RiderGeoService $geo)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        $riders = $geo->nearby(
            $request->lat,
            $request->lng,
            5
        );

        return response()->json([
            'success' => true,
            'riders' => $riders
        ]);
    }
}
