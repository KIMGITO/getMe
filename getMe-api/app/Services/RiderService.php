<?php

namespace App\Services;

use App\Models\Rider;
use App\Models\User;

class RiderService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    function isRiderProfileSet(User $user){
        return Rider::where('user_id', $user->id)->exists();
        
    }
}
