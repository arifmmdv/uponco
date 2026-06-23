<?php

namespace App\Support\Appointments;

use App\Models\Location;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use App\Models\WorkHour;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

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
     * @return array<int, array{id: int, title: string, description: ?string, duration: int, price_type: string, price: ?string, price_min: ?string, price_max: ?string, delivery_type: string, category_id: int, category_name: string, location_ids: array<int, int>, specialist_ids: array<int, int>}>
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
                'description' => $service->description,
                'duration' => $service->duration,
                'price_type' => $service->price_type->value,
                'price' => $service->price,
                'price_min' => $service->price_min,
                'price_max' => $service->price_max,
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
     * @return array<int, array{id: int, name: string, service_ids: array<int, int>, specialist_ids: array<int, int>}>
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
                'service_ids' => $location->services->pluck('id')->all(),
                'specialist_ids' => $location->specialists->pluck('id')->all(),
            ])
            ->all();
    }

    /**
     * Get the team's specialists, including their service and location relationships.
     *
     * @return array<int, array{id: int, name: string, service_ids: array<int, int>, location_ids: array<int, int>, next_available: ?array{date: string, label: string, slots: array<int, string>}}>
     */
    public static function specialists(Team $team): array
    {
        $timezone = $team->timezone ?: config('app.timezone');

        return $team->members()
            ->with(['services:id', 'locations:id', 'workHours'])
            ->orderBy('name')
            ->get()
            ->map(fn (User $member): array => [
                'id' => $member->id,
                'name' => $member->name,
                'service_ids' => $member->services->pluck('id')->all(),
                'location_ids' => $member->locations->pluck('id')->all(),
                'next_available' => static::nextAvailablePreview($member, $timezone),
            ])
            ->all();
    }

    /**
     * Build a lightweight "nearest working day" preview for a specialist.
     *
     * This scans the upcoming days for the first one the specialist works and
     * returns a handful of half-hour time labels across that day's work window.
     * It is a teaser only — the real bookable slots are generated per service
     * once a service, specialist and date have all been chosen.
     *
     * @return ?array{date: string, label: string, slots: array<int, string>}
     */
    protected static function nextAvailablePreview(User $specialist, string $timezone): ?array
    {
        if ($specialist->workHours->isEmpty()) {
            return null;
        }

        $now = CarbonImmutable::now($timezone);

        for ($offset = 0; $offset < 14; $offset++) {
            $day = $now->addDays($offset)->startOfDay();
            $dayOfWeek = $day->dayOfWeekIso - 1; // 0 = Monday ... 6 = Sunday

            $hours = $specialist->workHours
                ->where('day_of_week', $dayOfWeek)
                ->sortBy('start_time');

            if ($hours->isEmpty()) {
                continue;
            }

            $slots = static::previewSlots($hours, $day, $now, $offset === 0);

            if ($slots === []) {
                continue;
            }

            return [
                'date' => $day->format('Y-m-d'),
                'label' => $day->isToday() ? 'Today' : ($day->isTomorrow() ? 'Tomorrow' : $day->format('D, j M')),
                'slots' => $slots,
            ];
        }

        return null;
    }

    /**
     * Generate half-hour preview time labels across a specialist's work windows.
     *
     * @param  Collection<int, WorkHour>  $hours
     * @return array<int, string>
     */
    protected static function previewSlots(
        Collection $hours,
        CarbonImmutable $day,
        CarbonImmutable $now,
        bool $isToday,
    ): array {
        $slots = [];

        foreach ($hours as $window) {
            $cursor = $day->setTimeFromTimeString($window->start_time);
            $end = $day->setTimeFromTimeString($window->end_time);

            while ($cursor < $end && count($slots) < 12) {
                if (! $isToday || $cursor->greaterThan($now)) {
                    $slots[] = $cursor->format('H:i');
                }

                $cursor = $cursor->addMinutes(30);
            }
        }

        return $slots;
    }
}
