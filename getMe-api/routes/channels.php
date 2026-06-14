<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('mpesa.transaction.status.changed.user.{id}',  function ($user,  $id){
    return (string) $user->id === (string) $id;
    return true;
});
