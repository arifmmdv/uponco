<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\Company\BrandController;
use App\Http\Controllers\Company\BusinessController;
use App\Http\Controllers\Company\BusinessInvitationController;
use App\Http\Controllers\Company\BusinessMemberController;
use App\Http\Controllers\Company\CompanyController;
use App\Http\Controllers\Company\LocationController;
use App\Http\Controllers\Company\ServiceCategoryController;
use App\Http\Controllers\Company\ServiceController;
use App\Http\Controllers\Company\WorkHoursController;
use App\Http\Controllers\Company\WorkProfileController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\PublicAppointmentController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

/**
 * Temporary diagnostic endpoint to verify mail + queue delivery.
 *
 * - GET /send-test-email           sends synchronously (tests the mailer only).
 * - GET /send-test-email?queue=1   pushes a queued job (tests the full queue path).
 */
Route::get('send-test-email', function (Request $request) {
    $recipient = 'arif.mmdv@gmail.com';
    $sentAt = now()->toDateTimeString();

    $send = function () use ($recipient, $sentAt): void {
        Mail::raw("This is a test email from Uponco.\nSent at: {$sentAt}", function ($message) use ($recipient): void {
            $message->to($recipient)->subject('Uponco test email');
        });
    };

    $diagnostics = [
        'recipient' => $recipient,
        'mailer' => config('mail.default'),
        'queue_connection' => config('queue.default'),
        'sent_at' => $sentAt,
    ];

    if ($request->boolean('queue')) {
        dispatch($send);

        return response()->json([
            'status' => 'queued',
            'message' => 'Job pushed to the queue. The email is only delivered once a worker processes it.',
            ...$diagnostics,
        ]);
    }

    try {
        $send();

        return response()->json([
            'status' => 'sent',
            'message' => 'Mail handed off to the mailer synchronously. Check the inbox.',
            ...$diagnostics,
        ]);
    } catch (Throwable $e) {
        return response()->json([
            'status' => 'failed',
            'error' => $e->getMessage(),
            ...$diagnostics,
        ], 500);
    }
});

Route::get('appointments/{company}', [PublicAppointmentController::class, 'show'])->name('public.appointments.show');
Route::post('appointments/{company}', [PublicAppointmentController::class, 'store'])->name('public.appointments.store');

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

        Route::get('company/brand', [BrandController::class, 'index'])->name('company.brand.index');

        Route::get('company/work-profile', [WorkProfileController::class, 'edit'])->name('company.work-profile.edit');
        Route::patch('company/work-profile', [WorkProfileController::class, 'update'])->name('company.work-profile.update');

        Route::get('company/work-hours', [WorkHoursController::class, 'edit'])->name('company.work-hours.edit');
        Route::put('company/work-hours', [WorkHoursController::class, 'update'])->name('company.work-hours.update');

        Route::redirect('company/business', 'company/business/general')->name('company.business');
        Route::get('company/business/general', [BusinessController::class, 'edit'])->name('company.business.edit');
        Route::patch('company/business/general', [BusinessController::class, 'update'])->name('company.business.update');
        Route::delete('company/business/general', [BusinessController::class, 'destroy'])->name('company.business.destroy');

        Route::get('company/business/members', [BusinessController::class, 'members'])->name('company.business.members.index');
        Route::patch('company/business/members/{user}', [BusinessMemberController::class, 'update'])->name('company.business.members.update');
        Route::delete('company/business/members/{user}', [BusinessMemberController::class, 'destroy'])->name('company.business.members.destroy');

        Route::post('company/business/invitations', [BusinessInvitationController::class, 'store'])->name('company.business.invitations.store');
        Route::delete('company/business/invitations/{invitation}', [BusinessInvitationController::class, 'destroy'])->name('company.business.invitations.destroy');

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
