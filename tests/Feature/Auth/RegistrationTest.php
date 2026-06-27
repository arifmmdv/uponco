<?php

use App\Enums\BusinessCategory;
use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'company_name' => 'Acme Studio',
        'business_category' => BusinessCategory::Hairdresser->value,
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();

    $user = User::where('email', 'test@example.com')->first();
    $response->assertRedirect(route('dashboard'));

    $team = $user->currentTeam;
    expect($team->name)->toBe('Acme Studio');
    expect($team->is_personal)->toBeTrue();
    expect($team->business_category)->toBe(BusinessCategory::Hairdresser);
});

test('registration requires a company name and business category', function () {
    $response = $this->from(route('register'))->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors(['company_name', 'business_category']);
    $this->assertGuest();
});
