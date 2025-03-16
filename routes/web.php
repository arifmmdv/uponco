<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Company\CompanyController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

//Route::get('/assign-role', function () {
//    $team = \App\Models\Team::find(1);
//    $user = \App\Models\User::find(1);
//    $owner = \App\Models\Role::where('name', 'company-owner')->first();
//
//    $user->addRole($owner, $team);
//})->name('home');
//
//Route::get('/check-role', function () {
//    $team = \App\Models\Team::find(1);
//    $user = \App\Models\User::find(1);
//    $owner = \App\Models\Role::where('name', 'company-owner')->first();
//
//    return $user->rolesTeams;
//})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Company
    Route::redirect('company', 'company/general');
    Route::get('company/general', [CompanyController::class, 'view'])->name('company.general');
    Route::patch('company/general', [CompanyController::class, 'update'])->name('company.update');
    Route::get('company/staff', [CompanyController::class, 'staff'])->name('company.staff');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
