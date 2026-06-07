<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateWorkHoursRequest;
use App\Models\WorkHour;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WorkHoursController extends Controller
{
    /**
     * Show the user's work hours settings page.
     */
    public function edit(Request $request): Response
    {
        $workHours = $request->user()->workHours()->orderBy('start_time')->get();

        return Inertia::render('settings/work-hours', [
            'schedule' => $this->toWeeklySchedule($workHours),
        ]);
    }

    /**
     * Replace the user's work hours with the submitted schedule.
     */
    public function update(UpdateWorkHoursRequest $request): RedirectResponse
    {
        $schedule = $request->validated('schedule');
        $userId = $request->user()->id;

        DB::transaction(function () use ($schedule, $userId): void {
            WorkHour::where('user_id', $userId)->delete();

            $rows = [];
            $now = now();

            foreach (WorkHour::DAYS as $dayOfWeek => $day) {
                if (! ($schedule[$day]['enabled'] ?? false)) {
                    continue;
                }

                foreach ($schedule[$day]['slots'] ?? [] as $slot) {
                    $rows[] = [
                        'user_id' => $userId,
                        'day_of_week' => $dayOfWeek,
                        'start_time' => $slot['start'],
                        'end_time' => $slot['end'],
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }

            if ($rows !== []) {
                WorkHour::insert($rows);
            }
        });

        return back()->with('status', 'work-hours-updated');
    }

    /**
     * Transform flat work hour rows into the nested weekly schedule shape.
     *
     * Always returns all 7 day keys; days with no rows become disabled with no slots.
     *
     * @param  Collection<int, WorkHour>  $workHours
     * @return array<string, array{enabled: bool, slots: array<int, array{start: string, end: string}>}>
     */
    protected function toWeeklySchedule($workHours): array
    {
        $schedule = [];

        foreach (WorkHour::DAYS as $dayOfWeek => $day) {
            $slots = $workHours
                ->where('day_of_week', $dayOfWeek)
                ->map(fn (WorkHour $workHour): array => [
                    'start' => substr((string) $workHour->start_time, 0, 5),
                    'end' => substr((string) $workHour->end_time, 0, 5),
                ])
                ->values()
                ->all();

            $schedule[$day] = [
                'enabled' => $slots !== [],
                'slots' => $slots,
            ];
        }

        return $schedule;
    }
}
