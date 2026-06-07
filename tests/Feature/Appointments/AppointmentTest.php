<?php

use App\Enums\TeamRole;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use App\Models\WorkHour;
use App\Support\Appointments\SlotGenerator;
use Carbon\CarbonImmutable;

/**
 * Build a fully related service/location/specialist scenario with work hours,
 * and return the pieces plus a valid future start instant.
 */
function bookableSetup(array $serviceOverrides = []): array
{
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $category = ServiceCategory::factory()->for($team)->create();
    $service = Service::factory()->for($category, 'category')->create(array_merge([
        'duration' => 60,
        'technical_break' => 0,
        'delivery_type' => 'onsite',
        'online_meeting_provider' => null,
        'is_active' => true,
    ], $serviceOverrides));

    $location = Location::factory()->for($team)->create(['timezone' => 'UTC']);

    $service->locations()->attach($location);
    $service->specialists()->attach($user);
    $location->specialists()->attach($user);

    foreach (range(0, 6) as $dayOfWeek) {
        WorkHour::factory()->for($user)->create([
            'day_of_week' => $dayOfWeek,
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);
    }

    $startAt = CarbonImmutable::now('UTC')->addWeek()->startOfWeek()->setTime(9, 0);

    return compact('user', 'team', 'service', 'location', 'startAt');
}

function appointmentPayload(array $setup, array $overrides = []): array
{
    return array_merge([
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt']->toIso8601String(),
        'customer_name' => 'Jane Doe',
        'customer_email' => 'jane@example.com',
        'customer_phone' => '+1 555 123 4567',
        'notes' => 'First visit',
    ], $overrides);
}

test('the appointments page can be rendered', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->get(route('appointments.index', ['current_team' => $team->slug]))
        ->assertOk();
});

test('an appointment can be created and creates a customer', function () {
    $setup = bookableSetup();

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store', ['current_team' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'team_id' => $setup['team']->id,
        'email' => 'jane@example.com',
    ]);

    $this->assertDatabaseHas('appointments', [
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'delivery_type' => 'onsite',
        'notes' => 'First visit',
    ]);

    $appointment = Appointment::first();
    expect($appointment->end_at->toIso8601String())
        ->toBe($setup['startAt']->addMinutes(60)->toIso8601String());
});

test('an appointment reuses an existing customer with the same email', function () {
    $setup = bookableSetup();
    $customer = Customer::factory()->for($setup['team'])->create(['email' => 'jane@example.com']);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store', ['current_team' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertRedirect();

    expect(Customer::count())->toBe(1);
    expect(Appointment::first()->customer_id)->toBe($customer->id);
});

test('the slot generator produces available times within work hours', function () {
    $setup = bookableSetup();

    $slots = SlotGenerator::generate(
        $setup['service'],
        $setup['location'],
        $setup['user'],
        $setup['startAt']->format('Y-m-d'),
    );

    expect($slots)->not->toBeEmpty();

    // 09:00 to 17:00 with 60 minute slots and no break yields 8 slots.
    expect($slots)->toHaveCount(8);
    expect($slots[0]['label'])->toBe('09:00');

    $first = collect($slots)->firstWhere('start', $setup['startAt']->toIso8601String());
    expect($first['available'])->toBeTrue();
});

test('the slot generator disables already booked times for the specialist', function () {
    $setup = bookableSetup();

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $slots = SlotGenerator::generate(
        $setup['service'],
        $setup['location'],
        $setup['user'],
        $setup['startAt']->format('Y-m-d'),
    );

    $booked = collect($slots)->firstWhere('start', $setup['startAt']->toIso8601String());
    expect($booked['available'])->toBeFalse();
});

test('a booked slot cannot be double booked for the specialist', function () {
    $setup = bookableSetup();

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store', ['current_team' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertSessionHasErrors('start_at');
});

test('an appointment requires a service, location and specialist', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->post(route('appointments.store', ['current_team' => $team->slug]), [
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
        ])
        ->assertSessionHasErrors(['service_id', 'location_id', 'specialist_id', 'start_at']);
});

test('an appointment rejects a specialist who does not provide the service', function () {
    $setup = bookableSetup();
    $other = User::factory()->create();
    $setup['team']->members()->attach($other, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store', ['current_team' => $setup['team']->slug]), appointmentPayload($setup, [
            'specialist_id' => $other->id,
        ]))
        ->assertSessionHasErrors('specialist_id');
});

test('an appointment can be updated', function () {
    $setup = bookableSetup();
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt']->addDay(),
        'end_at' => $setup['startAt']->addDay()->addMinutes(60),
    ]);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.update', ['current_team' => $setup['team']->slug, 'appointment' => $appointment]), appointmentPayload($setup, [
            'notes' => 'Updated note',
        ]))
        ->assertRedirect();

    $this->assertDatabaseHas('appointments', [
        'id' => $appointment->id,
        'notes' => 'Updated note',
        'start_at' => $setup['startAt']->toDateTimeString(),
    ]);
});

test('an appointment can be deleted', function () {
    $setup = bookableSetup();
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'specialist_id' => $setup['user']->id,
    ]);

    $this
        ->actingAs($setup['user'])
        ->delete(route('appointments.destroy', ['current_team' => $setup['team']->slug, 'appointment' => $appointment]))
        ->assertRedirect();

    $this->assertSoftDeleted($appointment);
});

test('an appointment from another team cannot be deleted', function () {
    $setup = bookableSetup();
    $otherAppointment = Appointment::factory()->create();

    $this
        ->actingAs($setup['user'])
        ->delete(route('appointments.destroy', ['current_team' => $setup['team']->slug, 'appointment' => $otherAppointment]))
        ->assertForbidden();
});
