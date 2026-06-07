<?php

use App\Models\User;
use App\Models\WorkHour;

test('work hours page is displayed with the full weekly schedule', function () {
    $user = User::factory()->create();

    WorkHour::factory()->for($user)->create([
        'day_of_week' => 0,
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    $this->actingAs($user)
        ->get(route('work-hours.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/work-hours')
            ->where('schedule.monday.enabled', true)
            ->where('schedule.monday.slots.0.start', '09:00')
            ->where('schedule.monday.slots.0.end', '17:00')
            ->where('schedule.tuesday.enabled', false)
            ->where('schedule.sunday.enabled', false)
        );
});

test('enabled days are persisted and disabled days are ignored', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put(route('work-hours.update'), [
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

    WorkHour::factory()->for($user)->create(['day_of_week' => 5]);

    $this->actingAs($user)
        ->put(route('work-hours.update'), [
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

    $this->actingAs($user)
        ->put(route('work-hours.update'), [
            'schedule' => array_merge(emptySchedule(), [
                'monday' => ['enabled' => true, 'slots' => []],
            ]),
        ])
        ->assertSessionHasErrors('schedule.monday.slots');
});

test('a slot end time must be after its start time', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put(route('work-hours.update'), [
            'schedule' => array_merge(emptySchedule(), [
                'monday' => [
                    'enabled' => true,
                    'slots' => [['start' => '17:00', 'end' => '09:00']],
                ],
            ]),
        ])
        ->assertSessionHasErrors('schedule.monday.slots.0.end');
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
