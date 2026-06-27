<?php

namespace App\Http\Controllers;

use App\Enums\OnboardingStep;
use App\Enums\TeamRole;
use App\Models\Location;
use App\Models\OnboardingProgress;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Team;
use App\Models\User;
use App\Models\WorkHour;
use App\Support\LocationOptions;
use App\Support\ServiceOptions;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the dashboard, including the onboarding wizard for owners and admins.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $user->currentTeam;

        return Inertia::render('dashboard', [
            'onboarding' => $this->onboarding($user, $team),
        ]);
    }

    /**
     * Build the onboarding payload, or null when it should not be shown.
     *
     * @return array<string, mixed>|null
     */
    protected function onboarding(User $user, Team $team): ?array
    {
        $role = $user->teamRole($team);

        if ($role === null || ! $role->isAtLeast(TeamRole::Admin)) {
            return null;
        }

        $progress = OnboardingProgress::firstOrCreate([
            'team_id' => $team->id,
            'user_id' => $user->id,
        ]);

        $progress->syncFromData($team, $user);
        $progress->refreshCompletion();

        if ($progress->isDirty()) {
            $progress->save();
        }

        if ($progress->completed_at !== null) {
            return null;
        }

        return [
            'currentStep' => $progress->current_step->value,
            'steps' => collect(OnboardingStep::cases())->map(fn (OnboardingStep $step): array => [
                'key' => $step->value,
                'label' => $step->label(),
                'status' => $progress->statusFor($step)->value,
                'mandatory' => $step->isMandatory(),
            ])->all(),
            'general' => [
                'name' => $team->name,
                'timezone' => $team->timezone,
                'businessCategory' => $team->business_category?->value,
                'timezones' => LocationOptions::timezones(),
            ],
            'members' => [
                'members' => $team->members()->orderBy('name')->get()->map(fn (User $member): array => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'avatar' => $member->avatar ?? null,
                    'role' => $member->pivot->role->value,
                    'role_label' => $member->pivot->role->label(),
                ]),
                'invitations' => $team->invitations()->whereNull('accepted_at')->get()->map(fn ($invitation): array => [
                    'code' => $invitation->code,
                    'email' => $invitation->email,
                    'role' => $invitation->role->value,
                    'role_label' => $invitation->role->label(),
                    'created_at' => $invitation->created_at->toISOString(),
                ]),
                'availableRoles' => TeamRole::assignable(),
                'permissions' => $user->toTeamPermissions($team),
            ],
            'locations' => [
                'locations' => $team->locations()
                    ->with(['services:id', 'specialists:id'])
                    ->orderBy('name')
                    ->get()
                    ->map(fn (Location $location): array => $this->toLocationArray($location)),
                'services' => $this->toOptions($team->services()->orderBy('title')->get(), 'title'),
                'specialists' => $this->toOptions($team->members()->orderBy('name')->get(), 'name'),
                'countries' => LocationOptions::countries(),
                'timezones' => LocationOptions::timezones(),
            ],
            'services' => [
                'categories' => $team->serviceCategories()->orderBy('name')->get()->map(fn (ServiceCategory $category): array => [
                    'id' => $category->id,
                    'name' => $category->name,
                ]),
                'services' => $team->services()
                    ->with(['locations:id', 'specialists:id'])
                    ->orderBy('title')
                    ->get()
                    ->map(fn (Service $service): array => $this->toServiceArray($service)),
                'locations' => $this->toOptions($team->locations()->orderBy('name')->get(), 'name'),
                'specialists' => $this->toOptions($team->members()->orderBy('name')->get(), 'name'),
                'priceTypes' => ServiceOptions::priceTypes(),
                'serviceTypes' => ServiceOptions::serviceTypes(),
                'deliveryTypes' => ServiceOptions::deliveryTypes(),
                'meetingProviders' => ServiceOptions::meetingProviders(),
            ],
            'profile' => [
                'name' => $user->profile?->name ?? $user->name,
                'email' => $user->profile?->email,
                'phone' => $user->profile?->phone,
                'job_title' => $user->profile?->job_title,
                'description' => $user->profile?->description,
            ],
            'workHours' => [
                'schedule' => $this->toWeeklySchedule($user->workHours()->orderBy('start_time')->get()),
            ],
        ];
    }

    /**
     * Map a collection of models into value/label select options.
     *
     * @param  Collection<int, Model>  $models
     * @return Collection<int, array{value: string, label: string}>
     */
    protected function toOptions($models, string $labelKey)
    {
        return $models->map(fn ($model): array => [
            'value' => (string) $model->id,
            'label' => $model->{$labelKey},
        ]);
    }

    /**
     * Transform a location into its form representation.
     *
     * @return array<string, mixed>
     */
    protected function toLocationArray(Location $location): array
    {
        return [
            'id' => $location->id,
            'is_active' => $location->is_active,
            'name' => $location->name,
            'country' => $location->country,
            'city' => $location->city,
            'street_address' => $location->street_address,
            'unit' => $location->unit,
            'postal_code' => $location->postal_code,
            'timezone' => $location->timezone,
            'phone' => $location->phone,
            'service_ids' => $location->services->pluck('id')->all(),
            'user_ids' => $location->specialists->pluck('id')->all(),
        ];
    }

    /**
     * Transform a service into its form representation.
     *
     * @return array<string, mixed>
     */
    protected function toServiceArray(Service $service): array
    {
        return [
            'id' => $service->id,
            'service_category_id' => $service->service_category_id,
            'is_active' => $service->is_active,
            'title' => $service->title,
            'price_type' => $service->price_type->value,
            'price' => $service->price,
            'price_min' => $service->price_min,
            'price_max' => $service->price_max,
            'duration' => $service->duration,
            'technical_break' => $service->technical_break,
            'service_type' => $service->service_type->value,
            'delivery_type' => $service->delivery_type->value,
            'online_meeting_provider' => $service->online_meeting_provider,
            'capacity' => $service->capacity,
            'description' => $service->description,
            'location_ids' => $service->locations->pluck('id')->all(),
            'user_ids' => $service->specialists->pluck('id')->all(),
        ];
    }

    /**
     * Transform flat work hour rows into the nested weekly schedule shape.
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
