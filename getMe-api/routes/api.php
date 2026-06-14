<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\RiderController;
use App\Http\Controllers\Api\RiderLocationController;
use App\Http\Controllers\Api\ShoppingListController;
use App\Http\Controllers\MpesaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WalletController;
use App\Services\Finance\MpesaService;

Route::post('/login/init', [AuthController::class, 'loginInit'])->name('login.init');
Route::post('/login', [AuthController::class, 'loginVerify'])->name('login.verify');
Route::post('/auth/register', [AuthController::class, 'register'])->name('register');


Route::post('/mpesa/stk-callback', function (Request $request) {
    $mpesaService = app(\App\Services\Finance\MpesaService::class);
    $processor = app(\App\Services\Finance\Transactions\TransactionProcessor::class);

    return $mpesaService->stkCallback($request->all(), $processor);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::prefix('riders')->name('riders.')->group(function () {
        Route::post('/{user}/profile', [RiderController::class, 'setupProfile'])->name('profile.update');

        // rider location
        Route::post('/location', [RiderLocationController::class, 'update'])->name('location.update');
        Route::post('/nearby', [RiderLocationController::class, 'nearby'])->name('nearby');
    });

    Route::prefix('clients')->name('clients.')->group(function () {
        Route::post('/{user}/profile', [ClientController::class, 'setupProfile'])->name('profile.update');
        Route::post('/address', [AddressController::class, 'store'])->name('address');
    });

    Route::prefix('addresses')->as('addresses.')->group(function () {
        Route::post('/{user}', [AddressController::class, 'store'])->name('store');
        Route::post('/{user}/{address}', [AddressController::class, 'store'])->name('update');
        Route::delete('/{address}', [AddressController::class, 'destroy'])->name('destroy');
    });

    Route::post('/shopping-list', [ShoppingListController::class, 'store'])->name('shoppingList.store');

    Route::post('/wallet/fund', [WalletController::class, 'fund'])->name('wallet.fund');
});
