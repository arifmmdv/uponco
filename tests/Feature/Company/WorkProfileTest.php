<?php

use App\Models\Profile;
use App\Models\User;

test('work profile page is displayed', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->get(route('company.work-profile.edit', ['current_team' => $team->slug]))
        ->assertOk();
});

test('work profile page prefills the name from the account when no profile exists', function () {
    $user = User::factory()->create(['name' => 'Jane Doe']);
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->get(route('company.work-profile.edit', ['current_team' => $team->slug]))
        ->assertInertia(fn ($page) => $page
            ->component('company/work-profile/profile')
            ->where('profile.name', 'Jane Doe')
            ->where('profile.email', null)
        );
});

test('work profile information can be created', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->patch(route('company.work-profile.update', ['current_team' => $team->slug]), [
            'name' => 'Public Name',
            'email' => 'public@example.com',
            'phone' => '+1 555 000 1111',
            'job_title' => 'Senior Stylist',
            'description' => 'Booking with me is easy.',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $profile = $user->refresh()->profile;

    expect($profile)->not->toBeNull();
    expect($profile->name)->toBe('Public Name');
    expect($profile->email)->toBe('public@example.com');
    expect($profile->job_title)->toBe('Senior Stylist');
});

test('work profile information can be updated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    Profile::factory()->for($user)->create(['name' => 'Old Name']);

    $this
        ->actingAs($user)
        ->patch(route('company.work-profile.update', ['current_team' => $team->slug]), [
            'name' => 'New Name',
        ])
        ->assertSessionHasNoErrors();

    expect($user->refresh()->profile->name)->toBe('New Name');
    expect(Profile::where('user_id', $user->id)->count())->toBe(1);
});

test('public email is not required', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->patch(route('company.work-profile.update', ['current_team' => $team->slug]), [
            'name' => 'Public Name',
        ])
        ->assertSessionHasNoErrors();

    expect($user->refresh()->profile->email)->toBeNull();
});

test('name is required', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->patch(route('company.work-profile.update', ['current_team' => $team->slug]), [
            'name' => '',
        ])
        ->assertSessionHasErrors('name');
});
