<?php

namespace App\Http\Requests\Settings;

use App\Models\WorkHour;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateWorkHoursRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'schedule' => ['required', 'array'],
        ];

        foreach (WorkHour::DAYS as $day) {
            $rules["schedule.{$day}"] = ['required', 'array'];
            $rules["schedule.{$day}.enabled"] = ['required', 'boolean'];
            $rules["schedule.{$day}.slots"] = ['array'];
            $rules["schedule.{$day}.slots.*.start"] = ['required', 'date_format:H:i'];
            $rules["schedule.{$day}.slots.*.end"] = ['required', 'date_format:H:i'];
        }

        return $rules;
    }

    /**
     * Get the additional validation rules using the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var array<string, array{enabled?: bool, slots?: array<int, mixed>}> $schedule */
            $schedule = $this->input('schedule', []);

            foreach (WorkHour::DAYS as $day) {
                $isEnabled = (bool) data_get($schedule, "{$day}.enabled", false);
                $slots = data_get($schedule, "{$day}.slots", []);

                if ($isEnabled && (! is_array($slots) || count($slots) === 0)) {
                    $validator->errors()->add(
                        "schedule.{$day}.slots",
                        __('Add at least one time block for an enabled day.')
                    );
                }

                if (! is_array($slots)) {
                    continue;
                }

                foreach ($slots as $index => $slot) {
                    $start = data_get($slot, 'start');
                    $end = data_get($slot, 'end');

                    if (is_string($start) && is_string($end) && $end <= $start) {
                        $validator->errors()->add(
                            "schedule.{$day}.slots.{$index}.end",
                            __('The end time must be after the start time.')
                        );
                    }
                }
            }
        });
    }
}
