<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use App\Models\WorkHour;

test('work hours page is displayed with the full weekly schedule', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    WorkHour::factory()->for($user)->create([
        'team_id' => $team->id,
        'day_of_week' => 0,
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    $this->actingAs($user)
        ->get(route('company.work-hours.edit', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('company/work-profile/work-hours')
            ->where('schedule.monday.enabled', true)
            ->where('schedule.monday.slots.0.start', '09:00')
            ->where('schedule.monday.slots.0.end', '17:00')
            ->where('schedule.tuesday.enabled', false)
            ->where('schedule.sunday.enabled', false)
        );
});

test('enabled days are persisted and disabled days are ignored', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->put(route('company.work-hours.update', ['current_team' => $team->slug]), [
            'schedule' => array_merge(
                emptySchedule(),
                [
                    'monday' => [
                        'enabled' => true,
                        'slots' => [
                            ['start' => '09:00', 'end' => '12:00'],
                            ['start' => '13:00', 'end' => '17:00'],
                        ],
                    ],
                    'wednesday' => [
                        'enabled' => false,
                        'slots' => [['start' => '09:00', 'end' => '17:00']],
                    ],
                ],
            ),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect($user->workHours()->count())->toBe(2);
    expect($user->workHours()->where('day_of_week', 2)->exists())->toBeFalse();
    expect($user->workHours()->where('day_of_week', 0)->count())->toBe(2);
});

test('updating replaces the existing work hours', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    WorkHour::factory()->for($user)->create(['team_id' => $team->id, 'day_of_week' => 5]);

    $this->actingAs($user)
        ->put(route('company.work-hours.update', ['current_team' => $team->slug]), [
            'schedule' => array_merge(emptySchedule(), [
                'tuesday' => [
                    'enabled' => true,
                    'slots' => [['start' => '08:00', 'end' => '16:00']],
                ],
            ]),
        ])
        ->assertSessionHasNoErrors();

    expect($user->workHours()->where('day_of_week', 5)->exists())->toBeFalse();
    expect($user->workHours()->where('day_of_week', 1)->count())->toBe(1);
});

test('an enabled day must have at least one slot', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->put(route('company.work-hours.update', ['current_team' => $team->slug]), [
            'schedule' => array_merge(emptySchedule(), [
                'monday' => ['enabled' => true, 'slots' => []],
            ]),
        ])
        ->assertSessionHasErrors('schedule.monday.slots');
});

test('a slot end time must be after its start time', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->put(route('company.work-hours.update', ['current_team' => $team->slug]), [
            'schedule' => array_merge(emptySchedule(), [
                'monday' => [
                    'enabled' => true,
                    'slots' => [['start' => '17:00', 'end' => '09:00']],
                ],
            ]),
        ])
        ->assertSessionHasErrors('schedule.monday.slots.0.end');
});

test('work hours are scoped per team so a user keeps a distinct schedule for each', function () {
    $user = User::factory()->create();
    $teamA = $user->currentTeam;

    $teamB = Team::factory()->create();
    $teamB->members()->attach($user, ['role' => TeamRole::Owner->value]);

    // Existing hours on team B must never surface while editing team A.
    WorkHour::factory()->for($user)->create([
        'team_id' => $teamB->id,
        'day_of_week' => 4,
        'start_time' => '10:00',
        'end_time' => '14:00',
    ]);

    // Save a Monday schedule for team A only.
    $this->actingAs($user)
        ->put(route('company.work-hours.update', ['current_team' => $teamA->slug]), [
            'schedule' => array_merge(emptySchedule(), [
                'monday' => ['enabled' => true, 'slots' => [['start' => '09:00', 'end' => '17:00']]],
            ]),
        ])
        ->assertSessionHasNoErrors();

    // Team A holds its own row; team B's schedule is untouched.
    expect($user->workHoursFor($teamA)->count())->toBe(1);
    expect($user->workHoursFor($teamA)->where('day_of_week', 0)->exists())->toBeTrue();
    expect($user->workHoursFor($teamB)->count())->toBe(1);
    expect($user->workHoursFor($teamB)->where('day_of_week', 4)->exists())->toBeTrue();

    // The edit page for team A shows only team A's schedule.
    $this->actingAs($user)
        ->get(route('company.work-hours.edit', ['current_team' => $teamA->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('schedule.monday.enabled', true)
            ->where('schedule.friday.enabled', false)
        );
});

/**
 * Build a fully-disabled weekly schedule payload.
 *
 * @return array<string, array{enabled: bool, slots: array<int, array{start: string, end: string}>}>
 */
function emptySchedule(): array
{
    return collect(WorkHour::DAYS)
        ->mapWithKeys(fn (string $day): array => [$day => ['enabled' => false, 'slots' => []]])
        ->all();
}
