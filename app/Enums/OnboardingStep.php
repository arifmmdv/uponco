<?php

namespace App\Enums;

enum OnboardingStep: string
{
    case General = 'general';
    case Locations = 'locations';
    case Services = 'services';
    case Profile = 'profile';
    case WorkHours = 'work_hours';

    /**
     * Get the database column used to persist this step's status.
     */
    public function column(): string
    {
        return "{$this->value}_status";
    }

    /**
     * Get the display label for the step.
     */
    public function label(): string
    {
        return match ($this) {
            self::General => 'General & team',
            self::Locations => 'Locations',
            self::Services => 'Services',
            self::Profile => 'Work profile',
            self::WorkHours => 'Work hours',
        };
    }

    /**
     * Determine if the step must be completed (cannot be skipped).
     */
    public function isMandatory(): bool
    {
        return match ($this) {
            self::General, self::Profile, self::WorkHours => true,
            default => false,
        };
    }

    /**
     * Get the next step in the onboarding flow, if any.
     */
    public function next(): ?self
    {
        $cases = self::cases();
        $index = array_search($this, $cases, true);

        return $cases[$index + 1] ?? null;
    }
}
