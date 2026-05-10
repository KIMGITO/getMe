<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('/login/init', [AuthController::class, 'loginInit'])->name('login.init');
Route::post('/login/verify', [AuthController::class, 'loginVerify'])->name('login.verify');
Route::post('/register',[AuthController::class, 'register'])->name('register');


Route::middleware('auth:sanctum')->group(function(){
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    })->name('logout');
});

