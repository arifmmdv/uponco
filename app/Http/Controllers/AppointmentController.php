<?php

namespace App\Http\Controllers;

use App\Http\Requests\Appointments\SaveAppointmentRequest;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use App\Support\Appointments\AppointmentOptions;
use App\Support\Appointments\SlotGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the team's appointments.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('appointments/index', [
            'appointments' => $team->appointments()
                ->with(['service:id,title', 'location:id,name,timezone', 'specialist:id,name', 'customer:id,name,email,phone'])
                ->orderBy('start_at')
                ->get()
                ->map(fn (Appointment $appointment): array => $this->toAppointmentArray($appointment)),
            'services' => AppointmentOptions::services($team),
            'locations' => AppointmentOptions::locations($team),
            'specialists' => AppointmentOptions::specialists($team),
            'availableSlots' => Inertia::optional(fn (): array => $this->availableSlots($request, $team)),
        ]);
    }

    /**
     * Store a newly created appointment.
     */
    public function store(SaveAppointmentRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        $customer = $this->resolveCustomer($team, $request->customerData());

        $team->appointments()->create([
            ...$request->appointmentData(),
            'customer_id' => $customer->id,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appointment created.')]);

        return back();
    }

    /**
     * Update the specified appointment.
     */
    public function update(SaveAppointmentRequest $request, string $current_team, Appointment $appointment): RedirectResponse
    {
        $this->authorizeAppointment($request, $appointment);

        $team = $request->user()->currentTeam;

        $customer = $this->resolveCustomer($team, $request->customerData());

        $appointment->update([
            ...$request->appointmentData(),
            'customer_id' => $customer->id,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appointment updated.')]);

        return back();
    }

    /**
     * Delete the specified appointment.
     */
    public function destroy(Request $request, string $current_team, Appointment $appointment): RedirectResponse
    {
        $this->authorizeAppointment($request, $appointment);

        $appointment->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appointment deleted.')]);

        return back();
    }

    /**
     * Find or create the customer for the appointment within the team.
     *
     * @param  array{name: string, email: ?string, phone: ?string}  $data
     */
    protected function resolveCustomer(Team $team, array $data): Customer
    {
        $existing = $team->customers()
            ->where(function ($query) use ($data): void {
                $query->when($data['email'], fn ($q) => $q->orWhere('email', $data['email']));
                $query->when($data['phone'], fn ($q) => $q->orWhere('phone', $data['phone']));
            })
            ->first();

        if ($existing) {
            return $existing;
        }

        return $team->customers()->create($data);
    }

    /**
     * Resolve the available slots for the current picker selection.
     *
     * @return array<int, array{start: string, end: string, label: string, available: bool}>
     */
    protected function availableSlots(Request $request, Team $team): array
    {
        $data = $request->validate([
            'service_id' => ['required', 'integer'],
            'location_id' => ['required', 'integer'],
            'specialist_id' => ['required', 'integer'],
            'date' => ['required', 'date_format:Y-m-d'],
            'appointment_id' => ['nullable', 'integer'],
        ]);

        $service = $team->services()->whereKey($data['service_id'])->first();
        $location = $team->locations()->whereKey($data['location_id'])->first();
        $specialist = $team->members()->whereKey($data['specialist_id'])->first();

        if (! $service instanceof Service || ! $location instanceof Location || ! $specialist instanceof User) {
            return [];
        }

        return SlotGenerator::generate(
            $service,
            $location,
            $specialist,
            $data['date'],
            $data['appointment_id'] ?? null,
        );
    }

    /**
     * Ensure the appointment belongs to the user's current team.
     */
    protected function authorizeAppointment(Request $request, Appointment $appointment): void
    {
        abort_unless($appointment->team_id === $request->user()->currentTeam->id, 403);
    }

    /**
     * Transform an appointment into its array representation.
     *
     * @return array<string, mixed>
     */
    protected function toAppointmentArray(Appointment $appointment): array
    {
        return [
            'id' => $appointment->id,
            'start_at' => $appointment->start_at->toIso8601String(),
            'end_at' => $appointment->end_at->toIso8601String(),
            'timezone' => $appointment->location->timezone,
            'notes' => $appointment->notes,
            'service' => [
                'id' => $appointment->service->id,
                'title' => $appointment->service->title,
            ],
            'location' => [
                'id' => $appointment->location->id,
                'name' => $appointment->location->name,
            ],
            'specialist' => [
                'id' => $appointment->specialist->id,
                'name' => $appointment->specialist->name,
            ],
            'customer' => [
                'id' => $appointment->customer->id,
                'name' => $appointment->customer->name,
                'email' => $appointment->customer->email,
                'phone' => $appointment->customer->phone,
            ],
            'service_id' => $appointment->service_id,
            'location_id' => $appointment->location_id,
            'specialist_id' => $appointment->specialist_id,
        ];
    }
}
