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

Route::post('/mpesa/b2c-result', function (Request $request) {
    $mpesaService = app(\App\Services\Finance\MpesaService::class);
    $processor = app(\App\Services\Finance\Transactions\TransactionProcessor::class);
    return $mpesaService->b2cCallback($request->all(), $processor);
});



Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::prefix('riders')->name('riders.')->group(function () {
        Route::get('/dashboard', [RiderController::class, 'dashboard'])->name('dashboard');
        Route::post('/profile', [RiderController::class, 'setupProfile'])->name('profile.update');
        Route::patch('/location', [RiderLocationController::class, 'update'])->name('location.update');
        Route::post('/nearby', [RiderLocationController::class, 'nearby'])->name('nearby');
        Route::get('/verification-status', [RiderController::class, 'verificationStatus'])->name('verificationStatus');
        Route::patch('/online-status', [RiderController::class, 'toggleOnlineStatus'])->name('toggleOnlineStatus');
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

    Route::prefix('orders')->name('orders.')->group(function () {
        Route::post('/', [ShoppingListController::class, 'store'])
            ->name('store');
        Route::get('/', [ShoppingListController::class, 'index'])
            ->name('index');
        Route::post('/{id}/preview-fee', [ShoppingListController::class, 'previewFee'])
            ->name('preview-fee');
        Route::post('/{id}/checkout', [ShoppingListController::class, 'checkout'])
            ->name('checkout');
    });

    Route::prefix('wallet')->name('wallet.')->group(function () {
        Route::post('/fund', [WalletController::class, 'fund'])->name('fund');
        Route::post('/withdraw', [WalletController::class, 'withdraw'])->name('withdraw');
        Route::get('/balance/{user}', [WalletController::class, 'balance'])->name('balance');
        Route::get('/transactions/{user}', [WalletController::class, 'transactions'])->name('transactions');
    });
});
