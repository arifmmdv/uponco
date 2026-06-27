<?php

namespace App\Enums;

enum OnboardingStepStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Skipped = 'skipped';

    /**
     * Determine if the step has been resolved (completed or skipped).
     */
    public function isResolved(): bool
    {
        return $this === self::Completed || $this === self::Skipped;
    }
}
