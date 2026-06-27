<?php

use App\Enums\BusinessCategory;
use App\Enums\OnboardingStep;
use App\Enums\OnboardingStepStatus;
use App\Enums\TeamRole;
use App\Models\OnboardingProgress;
use App\Models\Team;
use App\Models\User;
use App\Models\WorkHour;

/**
 * Create a user that owns a fresh team with no setup data yet.
 *
 * @return array{0: User, 1: Team}
 */
function onboardingOwner(array $teamAttributes = []): array
{
    $user = User::factory()->create();
    $team = Team::factory()->create(array_merge(['timezone' => null], $teamAttributes));
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    return [$user, $team];
}

function dashboardRoute(Team $team): string
{
    return route('dashboard', ['current_team' => $team->slug]);
}

function onboardingStepRoute(Team $team, OnboardingStep $step): string
{
    return route('onboarding.steps.update', [
        'current_team' => $team->slug,
        'step' => $step->value,
    ]);
}

test('owners see the onboarding wizard with all six steps', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->get(dashboardRoute($team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('onboarding')
            ->has('onboarding.steps', 6)
            ->where('onboarding.currentStep', 'general')
        );
});

test('the general step payload carries the team name and business category', function () {
    [$user, $team] = onboardingOwner([
        'name' => 'Acme Studio',
        'business_category' => BusinessCategory::Hairdresser,
    ]);

    $this
        ->actingAs($user)
        ->get(dashboardRoute($team))
        ->assertInertia(fn ($page) => $page
            ->where('onboarding.general.name', 'Acme Studio')
            ->where('onboarding.general.businessCategory', 'hairdresser')
        );
});

test('regular members do not see the onboarding wizard', function () {
    [, $team] = onboardingOwner();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($member)
        ->get(dashboardRoute($team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('onboarding', null)
        );
});

test('mandatory steps auto-complete when their data already exists', function () {
    [$user, $team] = onboardingOwner(['timezone' => 'UTC']);
    $user->profile()->create(['name' => $user->name, 'job_title' => 'Stylist']);
    WorkHour::create([
        'user_id' => $user->id,
        'day_of_week' => 0,
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    $this
        ->actingAs($user)
        ->get(dashboardRoute($team))
        ->assertInertia(fn ($page) => $page
            ->where('onboarding.steps.0.status', 'completed')  // general
            ->where('onboarding.steps.4.status', 'completed')  // profile
            ->where('onboarding.steps.5.status', 'completed')  // work hours
        );

    $progress = OnboardingProgress::firstWhere('user_id', $user->id);
    expect($progress->statusFor(OnboardingStep::General))->toBe(OnboardingStepStatus::Completed);
    expect($progress->statusFor(OnboardingStep::Members))->toBe(OnboardingStepStatus::Pending);
});

test('an optional step can be skipped and advances the current step', function () {
    // Timezone set so the General step auto-resolves, leaving Locations next.
    [$user, $team] = onboardingOwner(['timezone' => 'UTC']);

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::Members), [
            'status' => OnboardingStepStatus::Skipped->value,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $progress = OnboardingProgress::firstWhere('user_id', $user->id);
    expect($progress->statusFor(OnboardingStep::Members))->toBe(OnboardingStepStatus::Skipped);
    expect($progress->current_step)->toBe(OnboardingStep::Locations);
});

test('a mandatory step cannot be skipped', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::General), [
            'status' => OnboardingStepStatus::Skipped->value,
        ])
        ->assertSessionHasErrors('status');
});

test('an invalid status is rejected', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::Members), [
            'status' => 'pending',
        ])
        ->assertSessionHasErrors('status');
});

test('completing a mandatory step requires the underlying data', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::General), [
            'status' => OnboardingStepStatus::Completed->value,
        ])
        ->assertSessionHasErrors('status');
});

test('regular members cannot update onboarding steps', function () {
    [, $team] = onboardingOwner();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($member)
        ->patch(onboardingStepRoute($team, OnboardingStep::Members), [
            'status' => OnboardingStepStatus::Skipped->value,
        ])
        ->assertForbidden();
});

test('the wizard disappears once every step is resolved', function () {
    [$user, $team] = onboardingOwner(['timezone' => 'UTC']);
    $user->profile()->create(['name' => $user->name, 'job_title' => 'Stylist']);
    WorkHour::create([
        'user_id' => $user->id,
        'day_of_week' => 0,
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    OnboardingProgress::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'members_status' => OnboardingStepStatus::Skipped,
        'locations_status' => OnboardingStepStatus::Skipped,
        'services_status' => OnboardingStepStatus::Skipped,
    ]);

    $this
        ->actingAs($user)
        ->get(dashboardRoute($team))
        ->assertInertia(fn ($page) => $page->where('onboarding', null));

    expect(OnboardingProgress::firstWhere('user_id', $user->id)->completed_at)->not->toBeNull();
});
