<?php

use App\Models\Customer;
use App\Models\User;

function customerPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'phone' => '+1 555 123 4567',
    ], $overrides);
}

test('the customers page can be rendered', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->get(route('customers.index', ['current_team' => $team->slug]))
        ->assertOk();
});

test('a customer can be created', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this
        ->actingAs($user)
        ->post(route('customers.store', ['current_team' => $team->slug]), customerPayload());

    $response->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'team_id' => $team->id,
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
    ]);
});

test('a customer can be created with only an email', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->post(route('customers.store', ['current_team' => $team->slug]), customerPayload([
            'phone' => '',
        ]))
        ->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'team_id' => $team->id,
        'email' => 'jane@example.com',
        'phone' => null,
    ]);
});

test('a customer can be created with only a phone', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->post(route('customers.store', ['current_team' => $team->slug]), customerPayload([
            'email' => '',
        ]))
        ->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'team_id' => $team->id,
        'phone' => '+1 555 123 4567',
        'email' => null,
    ]);
});

test('creating a customer requires a name', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->post(route('customers.store', ['current_team' => $team->slug]), customerPayload([
            'name' => '',
        ]))
        ->assertSessionHasErrors('name');
});

test('creating a customer requires at least an email or a phone', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->post(route('customers.store', ['current_team' => $team->slug]), customerPayload([
            'email' => '',
            'phone' => '',
        ]))
        ->assertSessionHasErrors(['email', 'phone']);
});

test('a customer can be updated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $customer = Customer::factory()->for($team)->create();

    $this
        ->actingAs($user)
        ->patch(route('customers.update', ['current_team' => $team->slug, 'customer' => $customer]), customerPayload([
            'name' => 'Updated Name',
        ]))
        ->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'id' => $customer->id,
        'name' => 'Updated Name',
    ]);
});

test('a customer can be deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $customer = Customer::factory()->for($team)->create();

    $this
        ->actingAs($user)
        ->delete(route('customers.destroy', ['current_team' => $team->slug, 'customer' => $customer]))
        ->assertRedirect();

    $this->assertSoftDeleted($customer);
});

test('a customer from another team cannot be updated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherCustomer = Customer::factory()->create();

    $this
        ->actingAs($user)
        ->patch(route('customers.update', ['current_team' => $team->slug, 'customer' => $otherCustomer]), customerPayload())
        ->assertForbidden();
});

test('a customer from another team cannot be deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherCustomer = Customer::factory()->create();

    $this
        ->actingAs($user)
        ->delete(route('customers.destroy', ['current_team' => $team->slug, 'customer' => $otherCustomer]))
        ->assertForbidden();
});
