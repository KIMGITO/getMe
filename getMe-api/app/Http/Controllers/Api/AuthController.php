<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterUserRequest;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{

    public function register(RegisterUserRequest $request)
    {
        return DB::transaction(function () use ($request) {

            $validated =  $request->validated();

            if(isset($validated['role'])) {
                if ($validated['role'] == 'admin' && Auth::user()->role !== 'admin') {
                    abort(403, 'Only admins can create other admins');
                    Log::warning("Unauthorized Admin Creation Attempt", [
                        'by_user_id' => Auth::id(),
                        'target_email' => $request->email
                    ]);
                }
            }

            $user = User::create($validated);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => "$user->name created successfully",
                'access_token' => $token,
                'user' => $user
            ], 201);
        });
    }


    public function loginInit(Request $request)
    {

        return DB::transaction(function () use($request){
            $request->validate([
                'identifier' => 'required', // can be email or phone
            ]);

            $user = User::where('email', $request->identifier)
                ->orWhere('phone', $request->identifier)
                ->first();

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            // Logic for Buyers (OTP-based)
            if ($user->role === 'buyer') {
                $code = $this->sendOtp($user);
                return response()->json([
                    'auth_type' => 'otp',
                    'message' => 'OTP sent to your registered phone number',
                    'code' => $code,
                ]);
            }

            // Logic for Admins/Riders (Password or PIN based)
            return response()->json([
                'auth_type' => 'credential',
                'message' => 'Please enter your Password or PIN'
            ]);
        });
    }

    /**
     * Step 2: Verify and Login
     */
    public function loginVerify(Request $request)
    {
        return DB::transaction(function() use($request){
            $request->validate([
                'identifier' => 'required',
                'credential' => 'required',
            ]);


            $user = User::where('email', $request->identifier)
                ->orWhere('phone', $request->identifier)
                ->first();

            if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

            // Check based on role
            if ($user->role === 'buyer') {
                $this->verifyOtp($user, $request->credential);
            } else {
                // Verify Password or PIN for staff/riders
                $valid = Hash::check($request->credential, $user->password) ||
                    Hash::check($request->credential, $user->pin);


                if (!$valid) throw ValidationException::withMessages(['credential' => 'Invalid PIN/Password']);

            }

            // Create token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ]);
        });
    }

    /**
     * Helper: Generate and "Send" OTP
     */
    protected function sendOtp(User $user)
    {

        return DB::transaction(function () use ($user) {
            $code = rand(1000, 9999);

            // Use updateOrCreate to prevent flooding the table
            Otp::updateOrCreate(
                ['user_id' => $user->id, 'purpose' => 'login'],
                [
                    'identifier' => $user->phone ?? $user->email,
                    'code' => Hash::make($code),
                    'is_used' => false,
                    'attempts' => 0,
                    'expires_at' => now()->addMinutes(10)
                ]
            );

            // TODO: Integration with SMS and Email
            Log::info("OTP for {$user->name}: {$code}");
            return $code;
        });
    }

    /**
     * Helper: Verify OTP
     */
    protected function verifyOtp(User $user, string $code)
    {
        return DB::transaction(function ()  use($user, $code){
        
            $otp = Otp::where('user_id', $user->id)
                ->where('purpose', 'login')
                ->where('is_used', false)
                ->where('expires_at', '>', now())
                ->first();

            if (!$otp || !Hash::check($code, $otp->code)) {

                if ($otp) {
                    $otp->increment('attempts');

                    if ($otp->attempts >= 6) {
                        $otp->update(['is_used' => true]); // Burn the OTP
                        return response()->json(['message' => 'Too many failed attempts. Request a new OTP.'], 422)->send();
                    }
                };
                throw ValidationException::withMessages(['credential' => 'Invalid PIN/Password']);

            }

            return $otp->update(['is_used' => true]);
        });
    }
}
