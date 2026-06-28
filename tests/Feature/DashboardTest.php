<?php

use App\Enums\TeamRole;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Team;
use App\Models\User;

/**
 * Create a team with a regular member so the onboarding wizard is skipped and
 * the dashboard renders its stats and upcoming appointments instead.
 *
 * @return array{0: User, 1: Team}
 */
function dashboardMember(): array
{
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    return [$member, $team];
}

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard'));

    $response->assertOk();
});

test('the dashboard reports booking and customer stats when onboarding is hidden', function () {
    [$member, $team] = dashboardMember();

    Customer::factory()->count(2)->create(['team_id' => $team->id]);
    Appointment::factory()->count(3)->create([
        'team_id' => $team->id,
        'start_at' => now()->addDay(),
        'end_at' => now()->addDay()->addHour(),
    ]);
    Appointment::factory()->create([
        'team_id' => $team->id,
        'start_at' => now()->subDay(),
        'end_at' => now()->subDay()->addHour(),
    ]);

    $this
        ->actingAs($member)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('onboarding', null)
            ->where('stats.customers', 2)
            ->where('stats.totalBookings', 4)
            ->where('stats.upcoming', 3)
            ->has('upcomingAppointments', 3)
            ->has('formOptions.appointments')
            ->has('formOptions.services')
            ->has('formOptions.locations')
        );
});

test('the dashboard omits stats while the onboarding wizard is shown', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($owner)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('stats', null)
            ->where('upcomingAppointments', null)
            ->where('formOptions', null)
            ->has('onboarding')
        );
});
