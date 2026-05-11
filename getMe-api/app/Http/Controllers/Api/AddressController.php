<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddressRequest;
use App\Models\Address;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Laravel\Mcp\Response;

class AddressController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AddressRequest $request, User $user, Address $address = null)
    {
        if (!in_array($user->role, ['client', 'admin'])) {
            return response()->json(['message' => 'Invalid action'], 403);
        }

        return DB::transaction(function () use ($request, $user, $address) {
            $validated = $request->validated();
            $validated['user_id'] = $user->id;
            $result = Address::updateOrCreate(
                ['id' => $address?->id],
                $validated
            );

            if ($validated['is_default']) {
                Address::where('user_id', $user->id)
                    ->where('id', '!=', $result->id)
                    ->update(['is_default' => false]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Address data saved successfully.',
                'data' => $result,
            ], $address ? 200 : 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }
    

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Address $address)
    {
        return DB::transaction(function () use ($address) {
            Address::delete($address->id);
            return response()->json([
                'success' => true,
                'message' => 'Address deleted',
            ]);
        });
    }
}
