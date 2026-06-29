<?php

use App\Enums\TeamRole;
use App\Models\Location;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Team;
use App\Models\User;

function locationPayload(array $overrides = []): array
{
    return array_merge([
        'is_active' => true,
        'name' => 'Head Office',
        'country' => 'US',
        'city' => 'San Francisco',
        'street_address' => '123 Market St',
        'unit' => 'Suite 400',
        'postal_code' => '94103',
        'phone' => '+1 555 123 4567',
    ], $overrides);
}

test('the locations page can be rendered', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->get(route('company.locations.index', ['current_team' => $team->slug]))
        ->assertOk();
});

test('the company page can be rendered', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->get(route('company.index', ['current_team' => $team->slug]))
        ->assertOk();
});

test('a location can be created', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this
        ->actingAs($user)
        ->post(route('company.locations.store', ['current_team' => $team->slug]), locationPayload());

    $response->assertRedirect();

    $this->assertDatabaseHas('locations', [
        'team_id' => $team->id,
        'name' => 'Head Office',
        'country' => 'US',
        'city' => 'San Francisco',
        'is_active' => true,
    ]);
});

test('creating a location requires valid fields', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this
        ->actingAs($user)
        ->post(route('company.locations.store', ['current_team' => $team->slug]), locationPayload([
            'name' => '',
            'country' => 'ZZ',
        ]));

    $response->assertSessionHasErrors(['name', 'country']);
});

test('a location can be updated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $location = Location::factory()->for($team)->create(['name' => 'Old Name']);

    $response = $this
        ->actingAs($user)
        ->patch(
            route('company.locations.update', ['current_team' => $team->slug, 'location' => $location->id]),
            locationPayload(['name' => 'New Name', 'is_active' => false]),
        );

    $response->assertRedirect();

    $this->assertDatabaseHas('locations', [
        'id' => $location->id,
        'name' => 'New Name',
        'is_active' => false,
    ]);
});

test('a location can be created with assigned services and specialists', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();
    $service = Service::factory()->for($category, 'category')->create();
    $specialist = User::factory()->create();
    $team->members()->attach($specialist, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($user)
        ->post(
            route('company.locations.store', ['current_team' => $team->slug]),
            locationPayload([
                'service_ids' => [$service->id],
                'user_ids' => [$specialist->id],
            ]),
        )
        ->assertRedirect();

    $location = Location::firstWhere('name', 'Head Office');

    expect($location->services->pluck('id')->all())->toEqual([$service->id]);
    expect($location->specialists->pluck('id')->all())->toEqual([$specialist->id]);
});

test('updating a location re-syncs services and specialists', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $location = Location::factory()->for($team)->create();
    $category = ServiceCategory::factory()->for($team)->create();
    $oldService = Service::factory()->for($category, 'category')->create();
    $newService = Service::factory()->for($category, 'category')->create();
    $location->services()->attach($oldService);

    $this
        ->actingAs($user)
        ->patch(
            route('company.locations.update', ['current_team' => $team->slug, 'location' => $location->id]),
            locationPayload(['service_ids' => [$newService->id]]),
        )
        ->assertRedirect();

    expect($location->services()->pluck('services.id')->all())->toEqual([$newService->id]);
});

test('a location cannot be assigned a service from another team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $foreignCategory = ServiceCategory::factory()->create();
    $foreignService = Service::factory()->for($foreignCategory, 'category')->create();

    $this
        ->actingAs($user)
        ->post(
            route('company.locations.store', ['current_team' => $team->slug]),
            locationPayload(['service_ids' => [$foreignService->id]]),
        )
        ->assertSessionHasErrors(['service_ids.0']);
});

test('a location cannot be assigned a specialist who is not a team member', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $stranger = User::factory()->create();

    $this
        ->actingAs($user)
        ->post(
            route('company.locations.store', ['current_team' => $team->slug]),
            locationPayload(['user_ids' => [$stranger->id]]),
        )
        ->assertSessionHasErrors(['user_ids.0']);
});

test('a location can be deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $location = Location::factory()->for($team)->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('company.locations.destroy', ['current_team' => $team->slug, 'location' => $location->id]));

    $response->assertRedirect();

    $this->assertSoftDeleted('locations', ['id' => $location->id]);
});

test('a location cannot be updated from another team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $otherTeam = Team::factory()->create();
    $otherTeam->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $foreignLocation = Location::factory()->for($otherTeam)->create();

    $response = $this
        ->actingAs($user)
        ->patch(
            route('company.locations.update', ['current_team' => $team->slug, 'location' => $foreignLocation->id]),
            locationPayload(),
        );

    $response->assertForbidden();
});

test('guests cannot access locations', function () {
    $team = Team::factory()->create();

    $this
        ->get(route('company.locations.index', ['current_team' => $team->slug]))
        ->assertRedirect(route('login'));
});

test('users cannot access locations for teams they do not belong to', function () {
    $user = User::factory()->create();
    $otherTeam = Team::factory()->create();

    $this
        ->actingAs($user)
        ->get(route('company.locations.index', ['current_team' => $otherTeam->slug]))
        ->assertForbidden();
});
