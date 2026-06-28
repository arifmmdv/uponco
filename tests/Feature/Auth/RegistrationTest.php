<?php

use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register without company details', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();

    $user = User::where('email', 'test@example.com')->first();
    $team = $user->currentTeam;

    $response->assertRedirect(route('onboard.show', ['current_team' => $team->slug]));

    expect($team->is_personal)->toBeTrue();
    expect($team->name)->toBeNull();
    expect($team->business_category)->toBeNull();
    expect($team->timezone)->toBeNull();
    expect($team->slug)->toBe('test-user');
});
