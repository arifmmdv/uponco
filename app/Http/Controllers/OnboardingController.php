<?php

namespace App\Http\Controllers;

use App\Enums\OnboardingStep;
use App\Enums\OnboardingStepStatus;
use App\Enums\TeamRole;
use App\Models\OnboardingProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OnboardingController extends Controller
{
    /**
     * Save the general section without navigating away from the dashboard.
     *
     * Mirrors the team timezone update but returns the user to the onboarding
     * wizard rather than the business settings page.
     */
    public function saveGeneral(Request $request): RedirectResponse
    {
        $user = $request->user();
        $team = $user->currentTeam;

        $role = $user->teamRole($team);
        abort_unless($role !== null && $role->isAtLeast(TeamRole::Admin), 403);

        $validated = $request->validate([
            'timezone' => ['required', 'string', Rule::in(timezone_identifiers_list())],
        ]);

        $team->update(['timezone' => $validated['timezone']]);

        return back();
    }

    /**
     * Record the status of a single onboarding step for the current user.
     */
    public function update(Request $request, string $current_team, OnboardingStep $step): RedirectResponse
    {
        $user = $request->user();
        $team = $user->currentTeam;

        $role = $user->teamRole($team);
        abort_unless($role !== null && $role->isAtLeast(TeamRole::Admin), 403);

        $validated = $request->validate([
            'status' => ['required', Rule::enum(OnboardingStepStatus::class)->only([
                OnboardingStepStatus::Completed,
                OnboardingStepStatus::Skipped,
            ])],
        ]);

        $status = OnboardingStepStatus::from($validated['status']);

        if ($status === OnboardingStepStatus::Skipped && $step->isMandatory()) {
            throw ValidationException::withMessages([
                'status' => __('This step is required and cannot be skipped.'),
            ]);
        }

        $progress = OnboardingProgress::firstOrCreate([
            'team_id' => $team->id,
            'user_id' => $user->id,
        ]);

        if ($status === OnboardingStepStatus::Completed && $step->isMandatory()
            && ! $progress->hasDataForStep($step, $team, $user)) {
            throw ValidationException::withMessages([
                'status' => __('Please complete this step before continuing.'),
            ]);
        }

        $progress->markStep($step, $status);
        $progress->syncFromData($team, $user);
        $progress->current_step = $progress->firstUnresolvedStep();
        $progress->refreshCompletion();
        $progress->save();

        return back();
    }
}
