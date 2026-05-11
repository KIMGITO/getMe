<?php

namespace App\Services;

use App\Models\Client;
use App\Models\User;

class ClientService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function isClientProfileSet(User $user){
        return  Client::where('user_id', $user->id);
    }

}
