<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Services\SaveServiceRequest;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Team;
use App\Support\ServiceOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    /**
     * Display a listing of the team's services and categories.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('company/services/index', [
            'categories' => $team->serviceCategories()
                ->orderBy('name')
                ->get()
                ->map(fn (ServiceCategory $category): array => [
                    'id' => $category->id,
                    'name' => $category->name,
                ]),
            'services' => $team->services()
                ->orderBy('title')
                ->get()
                ->map(fn (Service $service): array => $this->toServiceArray($service)),
            'priceTypes' => ServiceOptions::priceTypes(),
            'serviceTypes' => ServiceOptions::serviceTypes(),
            'deliveryTypes' => ServiceOptions::deliveryTypes(),
            'meetingProviders' => ServiceOptions::meetingProviders(),
        ]);
    }

    /**
     * Store a newly created service.
     */
    public function store(SaveServiceRequest $request): RedirectResponse
    {
        Service::create($request->serviceData());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Service created.')]);

        return back();
    }

    /**
     * Update the specified service.
     */
    public function update(SaveServiceRequest $request, string $current_team, Service $service): RedirectResponse
    {
        $this->authorizeService($request, $service);

        $service->update($request->serviceData());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Service updated.')]);

        return back();
    }

    /**
     * Delete the specified service.
     */
    public function destroy(Request $request, string $current_team, Service $service): RedirectResponse
    {
        $this->authorizeService($request, $service);

        $service->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Service deleted.')]);

        return back();
    }

    /**
     * Ensure the service belongs to the user's current team.
     */
    protected function authorizeService(Request $request, Service $service): void
    {
        /** @var Team $team */
        $team = $request->user()->currentTeam;

        abort_unless($service->category->team_id === $team->id, 403);
    }

    /**
     * Transform a service into its array representation.
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
        ];
    }
}
