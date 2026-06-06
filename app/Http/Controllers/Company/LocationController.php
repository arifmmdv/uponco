<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Locations\SaveLocationRequest;
use App\Models\Location;
use App\Models\Team;
use App\Support\LocationOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    /**
     * Display a listing of the team's locations.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('company/locations/index', [
            'locations' => $team->locations()
                ->orderBy('name')
                ->get()
                ->map(fn (Location $location): array => $this->toLocationArray($location)),
            'countries' => LocationOptions::countries(),
            'timezones' => LocationOptions::timezones(),
        ]);
    }

    /**
     * Store a newly created location.
     */
    public function store(SaveLocationRequest $request): RedirectResponse
    {
        $request->user()->currentTeam->locations()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Location created.')]);

        return back();
    }

    /**
     * Update the specified location.
     */
    public function update(SaveLocationRequest $request, string $current_team, Location $location): RedirectResponse
    {
        $this->authorizeLocation($request, $location);

        $location->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Location updated.')]);

        return back();
    }

    /**
     * Delete the specified location.
     */
    public function destroy(Request $request, string $current_team, Location $location): RedirectResponse
    {
        $this->authorizeLocation($request, $location);

        $location->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Location deleted.')]);

        return back();
    }

    /**
     * Ensure the location belongs to the user's current team.
     */
    protected function authorizeLocation(Request $request, Location $location): void
    {
        /** @var Team $team */
        $team = $request->user()->currentTeam;

        abort_unless($location->team_id === $team->id, 403);
    }

    /**
     * Transform a location into its array representation.
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
        ];
    }
}
