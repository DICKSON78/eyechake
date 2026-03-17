<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Observers\DepartmentPerformanceReportObserver;
use App\Observers\PatientItemPaymentObserver;
use App\Observers\PatientCheckInObserver;
use App\Models\DepartmentPerformanceReport;
use App\Models\PatientItemPayment;
use App\Models\PatientCheckIn;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        if ($this->app->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Register Department Performance observers
        DepartmentPerformanceReport::observe(DepartmentPerformanceReportObserver::class);
        PatientItemPayment::observe(PatientItemPaymentObserver::class);
        PatientCheckIn::observe(PatientCheckInObserver::class);
    }
}
