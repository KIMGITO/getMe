<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClientRequest;
use App\Models\Client;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientController extends Controller
{
    public function  setupProfile(ClientRequest $request, User $user){

    if($user->role !== 'client'){
        throw new Exception('User is not a registered customer');
    }
        DB::transaction(function () use($request, $user){
            $validated = $request->validated();
            $validated['user_id'] = $user->id;
            $validated['verified'] = true;

            $client_profile = Client::updateOrCreate(['user_id' => $user->id], $validated);
            if($client_profile) {
                return response()->json([
                    'success' => true,
                    'message' => 'User data updated successfully',
                    'profile' => $client_profile,
                ]);
            }
        }); 

    }

    
}
