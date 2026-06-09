<?php

namespace App\Support\Appointments;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * Generates bookable time slots for a service/location/specialist on a given day.
 *
 * The work hours stored against a specialist are wall-clock times that are
 * interpreted in the team's timezone. Slots are produced in that timezone and
 * exposed as UTC instants so they can be stored and compared consistently.
 * This class is shared between the dashboard and the future public booking page.
 */
class SlotGenerator
{
    /**
     * Build the list of candidate slots for the given day.
     *
     * Each slot is returned as:
     * - start: ISO-8601 UTC instant of the slot start
     * - end: ISO-8601 UTC instant of the slot end (start + service duration)
     * - label: wall-clock start time (HH:MM) in the team timezone
     * - available: whether the slot can be booked (not in the past, not taken)
     *
     * @return array<int, array{start: string, end: string, label: string, available: bool}>
     */
    public static function generate(
        Service $service,
        User $specialist,
        string $timezone,
        string $date,
        ?int $ignoreAppointmentId = null,
        ?CarbonImmutable $now = null,
    ): array {
        $timezone = $timezone ?: config('app.timezone');

        $day = CarbonImmutable::createFromFormat('Y-m-d', $date, $timezone)->startOfDay();
        $now ??= CarbonImmutable::now($timezone);

        $dayOfWeek = $day->dayOfWeekIso - 1; // 0 = Monday ... 6 = Sunday

        $workHours = $specialist->workHours()
            ->where('day_of_week', $dayOfWeek)
            ->orderBy('start_time')
            ->get();

        if ($workHours->isEmpty()) {
            return [];
        }

        $duration = $service->duration;
        $step = $duration + $service->technical_break;

        $booked = static::bookedIntervals($specialist, $day, $ignoreAppointmentId);

        $slots = [];

        foreach ($workHours as $workHour) {
            $intervalStart = static::dateTimeOn($day, (string) $workHour->start_time);
            $intervalEnd = static::dateTimeOn($day, (string) $workHour->end_time);

            $slotStart = $intervalStart;

            while ($slotStart->addMinutes($duration)->lessThanOrEqualTo($intervalEnd)) {
                $slotEnd = $slotStart->addMinutes($duration);

                $isPast = $slotStart->lessThan($now);
                $isBooked = static::overlapsAny($slotStart, $slotEnd, $booked);

                $slots[] = [
                    'start' => $slotStart->utc()->toIso8601String(),
                    'end' => $slotEnd->utc()->toIso8601String(),
                    'label' => $slotStart->format('H:i'),
                    'available' => ! $isPast && ! $isBooked,
                ];

                $slotStart = $slotStart->addMinutes($step);
            }
        }

        return $slots;
    }

    /**
     * Determine whether the given UTC start instant maps to an available slot.
     */
    public static function isAvailableStart(
        Service $service,
        User $specialist,
        string $timezone,
        CarbonInterface $startAt,
        ?int $ignoreAppointmentId = null,
        ?CarbonImmutable $now = null,
    ): bool {
        $timezone = $timezone ?: config('app.timezone');
        $date = $startAt->copy()->setTimezone($timezone)->format('Y-m-d');

        $target = CarbonImmutable::parse($startAt)->utc()->toIso8601String();

        foreach (static::generate($service, $specialist, $timezone, $date, $ignoreAppointmentId, $now) as $slot) {
            if ($slot['start'] === $target) {
                return $slot['available'];
            }
        }

        return false;
    }

    /**
     * Build a wall-clock datetime on the given day from a stored time string.
     */
    protected static function dateTimeOn(CarbonImmutable $day, string $time): CarbonImmutable
    {
        [$hour, $minute] = explode(':', substr($time, 0, 5));

        return $day->setTime((int) $hour, (int) $minute);
    }

    /**
     * Fetch the specialist's existing appointment intervals overlapping the day.
     *
     * @return Collection<int, array{0: CarbonInterface, 1: CarbonInterface}>
     */
    protected static function bookedIntervals(User $specialist, CarbonImmutable $day, ?int $ignoreAppointmentId): Collection
    {
        return Appointment::query()
            ->where('specialist_id', $specialist->id)
            ->where('start_at', '<', $day->endOfDay()->utc())
            ->where('end_at', '>', $day->utc())
            ->when($ignoreAppointmentId, fn ($query) => $query->whereKeyNot($ignoreAppointmentId))
            ->get(['start_at', 'end_at'])
            ->map(fn (Appointment $appointment): array => [$appointment->start_at, $appointment->end_at]);
    }

    /**
     * Determine whether a slot overlaps any of the booked intervals.
     *
     * @param  Collection<int, array{0: CarbonInterface, 1: CarbonInterface}>  $booked
     */
    protected static function overlapsAny(CarbonImmutable $slotStart, CarbonImmutable $slotEnd, Collection $booked): bool
    {
        foreach ($booked as [$bookedStart, $bookedEnd]) {
            if ($slotStart->lessThan($bookedEnd) && $slotEnd->greaterThan($bookedStart)) {
                return true;
            }
        }

        return false;
    }
}
