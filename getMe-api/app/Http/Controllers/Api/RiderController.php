<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RiderRequest;
use App\Models\Rider;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;

class RiderController extends Controller
{
    public function setupProfile(RiderRequest $request, User $user){

    // rider profile setup
        if($user->role != 'rider'){
            throw new Exception('User is not a registered rider');
        }
        return DB::transaction(function () use($request, $user){
            $validated = $request->validated();
            $validated['user_id'] = $user->id ;
            $validated['is_verified'] = false;

            // Remember to implement image upload class and upload the ids images.
            $rider_profile = Rider::updateOrCreate(['user_id' => $user->id],$validated);

                if($rider_profile)  return response()->json([
                    'success' => true,
                    'message' => 'Rider profile submitted. Our team will verify your documents shortly',
                    'profile' => $rider_profile,
                ]);

                throw  new Exception('Failed to update rider profile. Please try again or contact support team');
        });
    }
}
