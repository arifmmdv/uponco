<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Company\CompanyController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Company
    Route::redirect('company', 'company/general');
    Route::get('company/general', [CompanyController::class, 'view'])->name('company.general');
    Route::get('company/staff', [CompanyController::class, 'staff'])->name('company.staff');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
