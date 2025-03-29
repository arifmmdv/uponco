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
    Route::patch('company/general', [CompanyController::class, 'update'])->name('company.update');

    Route::get('company/staff', [CompanyController::class, 'staff'])->name('company.staff');
    Route::post('company/staff', [CompanyController::class, 'addUser'])->name('company.addUser');
    Route::post('company/staff/update/{id}', [CompanyController::class, 'updateUser'])->name('company.updateUser');
    Route::post('company/staff/delete/{id}', [CompanyController::class, 'deleteUser'])->name('company.deleteUser');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
