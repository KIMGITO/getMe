<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RiderRequest;
use App\Models\Rider;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RiderController extends Controller
{
    public function setupProfile(RiderRequest $request){
    
         $user = $request->user();


        if($user->role != 'rider'){
            throw new Exception('User is not a registered rider');
        }


        return DB::transaction(function () use($request, $user){
            $validated = $request->validated();
            $validated['user_id'] = $user->id ;
            $validated['is_verified'] = false;
            $validated['is_waiting_verification'] = true;

            // Remember to implement image upload class and upload the ids images.
            $rider_profile = Rider::updateOrCreate(['user_id' => $user->id],$validated);

                if($rider_profile) {
                        return response()->json([
                        'success' => true,
                        'message' => 'Rider profile submitted. Our team will verify your documents shortly',
                        'profile' => $rider_profile,
                    ]);
                }
                throw  new Exception('Failed to update rider profile. Please try again or contact support team');
        });
    }

    public function  verificationStatus(Request $request){
        $user = $request->user();
        if($user->role != 'rider'){
            throw new Exception('User is not a registered rider');
        }
        $rider = Rider::where('user_id', $user->id)->first();
        
        if($rider) {
            $isVerified = $rider->is_verified;
            $isWaitingVerification = $rider->is_waiting_verification;

            // status can be 'pending' | 'verified' | 'rejected' | 'incomplete';

            if($isVerified) {
                $status = 'verified';
            } elseif ($isWaitingVerification) {
                $status = 'pending';
            } elseif(!$isVerified && !$isWaitingVerification) {
                $status = 'rejected';
            } else{
                $status = 'incomplete';
            }


            return response()->json([
                'success' => true,
                'status' => $status
            ]);
        }
        return response()->json([
                'success' => true,
                'status' => 'incomplete'
            ]);
    }
}
