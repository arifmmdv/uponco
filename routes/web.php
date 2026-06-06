<?php

use App\Http\Controllers\Company\CompanyController;
use App\Http\Controllers\Company\LocationController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');

        Route::get('company', [CompanyController::class, 'index'])->name('company.index');

        Route::get('company/locations', [LocationController::class, 'index'])->name('company.locations.index');
        Route::post('company/locations', [LocationController::class, 'store'])->name('company.locations.store');
        Route::patch('company/locations/{location}', [LocationController::class, 'update'])->name('company.locations.update');
        Route::delete('company/locations/{location}', [LocationController::class, 'destroy'])->name('company.locations.destroy');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
});

require __DIR__.'/settings.php';
