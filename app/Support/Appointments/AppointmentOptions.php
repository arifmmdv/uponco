<?php

namespace App\Support\Appointments;

use App\Models\Location;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;

/**
 * Builds the service/location/specialist option data needed to drive the
 * appointment booking picker. Each entity carries the ids of the related
 * entities so the client can narrow the available choices without extra
 * round trips. Shared between the dashboard and the future public page.
 */
class AppointmentOptions
{
    /**
     * Get the bookable services for the team, including their category and relationships.
     *
     * @return array<int, array{id: int, title: string, duration: int, delivery_type: string, category_id: int, category_name: string, location_ids: array<int, int>, specialist_ids: array<int, int>}>
     */
    public static function services(Team $team): array
    {
        return $team->services()
            ->where('services.is_active', true)
            ->with(['category:id,name', 'locations:id', 'specialists:id'])
            ->orderBy('title')
            ->get()
            ->map(fn (Service $service): array => [
                'id' => $service->id,
                'title' => $service->title,
                'duration' => $service->duration,
                'delivery_type' => $service->delivery_type->value,
                'category_id' => $service->service_category_id,
                'category_name' => $service->category->name,
                'location_ids' => $service->locations->pluck('id')->all(),
                'specialist_ids' => $service->specialists->pluck('id')->all(),
            ])
            ->all();
    }

    /**
     * Get the team's locations, including their service and specialist relationships.
     *
     * @return array<int, array{id: int, name: string, timezone: string, service_ids: array<int, int>, specialist_ids: array<int, int>}>
     */
    public static function locations(Team $team): array
    {
        return $team->locations()
            ->where('is_active', true)
            ->with(['services:id', 'specialists:id'])
            ->orderBy('name')
            ->get()
            ->map(fn (Location $location): array => [
                'id' => $location->id,
                'name' => $location->name,
                'timezone' => $location->timezone,
                'service_ids' => $location->services->pluck('id')->all(),
                'specialist_ids' => $location->specialists->pluck('id')->all(),
            ])
            ->all();
    }

    /**
     * Get the team's specialists, including their service and location relationships.
     *
     * @return array<int, array{id: int, name: string, service_ids: array<int, int>, location_ids: array<int, int>}>
     */
    public static function specialists(Team $team): array
    {
        return $team->members()
            ->with(['services:id', 'locations:id'])
            ->orderBy('name')
            ->get()
            ->map(fn (User $member): array => [
                'id' => $member->id,
                'name' => $member->name,
                'service_ids' => $member->services->pluck('id')->all(),
                'location_ids' => $member->locations->pluck('id')->all(),
            ])
            ->all();
    }
}
