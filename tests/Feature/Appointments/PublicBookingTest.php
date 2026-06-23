<?php

use App\Models\Appointment;
use App\Models\Customer;

test('the public booking page can be rendered', function () {
    $setup = bookableSetup();

    $this
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertOk();
});

test('a guest can book an appointment and a customer is created', function () {
    $setup = bookableSetup();

    $this
        ->post(route('public.appointments.store', ['company' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'team_id' => $setup['team']->id,
        'email' => 'jane@example.com',
    ]);

    $this->assertDatabaseHas('appointments', [
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'specialist_id' => $setup['user']->id,
        'delivery_type' => 'onsite',
    ]);
});

test('a guest booking reuses an existing customer with the same email', function () {
    $setup = bookableSetup();
    $customer = Customer::factory()->for($setup['team'])->create(['email' => 'jane@example.com']);

    $this
        ->post(route('public.appointments.store', ['company' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertRedirect();

    expect(Customer::count())->toBe(1);
    expect(Appointment::first()->customer_id)->toBe($customer->id);
});

test('a guest booking validates availability', function () {
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
        ->post(route('public.appointments.store', ['company' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertSessionHasErrors('start_at');
});
