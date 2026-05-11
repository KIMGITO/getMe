<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\RiderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('/login/init', [AuthController::class, 'loginInit'])->name('login.init');
Route::post('/login/verify', [AuthController::class, 'loginVerify'])->name('login.verify');
Route::post('/register',[AuthController::class, 'register'])->name('register');


Route::middleware('auth:sanctum')->group(function(){
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::prefix('riders')->name('rider.')->group(function (){
        Route::post('/{user}/profile/update', [RiderController::class, 'setupProfile'])->name('profile.update');
    });

    Route::prefix('clients')->name('client.')->group(function () {
        Route::post('/{user}/profile/update', [ClientController::class, 'setupProfile'])->name('profile.update');
    });
    Route::prefix('addresses')->as('addresses.')->group(function () {
        Route::post('/{user}', [AddressController::class, 'store'])->name('store');
        Route::post('/{user}/{address}', [AddressController::class, 'store'])->name('update');
        Route::delete('/{address}', [AddressController::class, 'destroy'])->name('destroy');
    });
   
});

