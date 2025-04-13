<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Company\CompanyController;
use App\Models\User;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/user-roles', function () {
    $currentUser = User::find(1);

    return response()->json($currentUser->allPermissions());
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::redirect('company', 'company/general')->middleware(['permission:edit-company']);
    Route::get('company/general', [CompanyController::class, 'view'])
        ->middleware(['permission:edit-company'])
        ->name('company.general');
    Route::patch('company/general', [CompanyController::class, 'update'])
        ->middleware(['permission:edit-company'])
        ->name('company.update');

    Route::get('company/staff', [CompanyController::class, 'staff'])
        ->middleware(['permission:list-staff'])
        ->name('company.staff');
    Route::post('company/staff', [CompanyController::class, 'addUser'])
        ->middleware(['permission:add-staff'])
        ->name('company.addUser');
    Route::post('company/staff/update/{id}', [CompanyController::class, 'updateUser'])
        ->middleware(['permission:edit-staff'])
        ->name('company.updateUser');
    Route::post('company/staff/delete/{id}', [CompanyController::class, 'deleteUser'])
        ->middleware(['permission:delete-staff'])
        ->name('company.deleteUser');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
