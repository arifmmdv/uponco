<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\Company\CompanyController;
use App\Http\Controllers\Company\LocationController;
use App\Http\Controllers\Company\ServiceCategoryController;
use App\Http\Controllers\Company\ServiceController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');

        Route::get('appointments', [AppointmentController::class, 'index'])->name('appointments.index');
        Route::post('appointments', [AppointmentController::class, 'store'])->name('appointments.store');
        Route::patch('appointments/{appointment}', [AppointmentController::class, 'update'])->name('appointments.update');
        Route::delete('appointments/{appointment}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');

        Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
        Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
        Route::patch('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
        Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

        Route::get('company', [CompanyController::class, 'index'])->name('company.index');

        Route::get('company/locations', [LocationController::class, 'index'])->name('company.locations.index');
        Route::post('company/locations', [LocationController::class, 'store'])->name('company.locations.store');
        Route::patch('company/locations/{location}', [LocationController::class, 'update'])->name('company.locations.update');
        Route::delete('company/locations/{location}', [LocationController::class, 'destroy'])->name('company.locations.destroy');

        Route::get('company/services', [ServiceController::class, 'index'])->name('company.services.index');
        Route::post('company/services', [ServiceController::class, 'store'])->name('company.services.store');
        Route::patch('company/services/{service}', [ServiceController::class, 'update'])->name('company.services.update');
        Route::delete('company/services/{service}', [ServiceController::class, 'destroy'])->name('company.services.destroy');

        Route::post('company/service-categories', [ServiceCategoryController::class, 'store'])->name('company.service-categories.store');
        Route::patch('company/service-categories/{serviceCategory}', [ServiceCategoryController::class, 'update'])->name('company.service-categories.update');
        Route::delete('company/service-categories/{serviceCategory}', [ServiceCategoryController::class, 'destroy'])->name('company.service-categories.destroy');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
});

require __DIR__.'/settings.php';
