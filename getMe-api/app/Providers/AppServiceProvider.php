<?php

namespace App\Providers;

use App\Models\User;
use App\Observers\UserObserver;
use App\Services\Finance\Transactions\TransactionProcessor;
use Codenson\Daraja\Daraja;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
        $this->app->singleton(TransactionProcessor::class);
        $this->app->singleton('daraja', function ($app) {
            return new Daraja($app['config']['daraja']);
            
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        User::observe(UserObserver::class);
    }
}
