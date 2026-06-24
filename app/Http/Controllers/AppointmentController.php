<?php

namespace App\Http\Controllers;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Http\Requests\Appointments\SaveAppointmentRequest;
use App\Models\Appointment;
use App\Support\Appointments\AppointmentOptions;
use App\Support\Appointments\SlotGenerator;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    use InteractsWithAppointmentBooking;

    /**
     * Display a listing of the team's appointments.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $timezone = $team->timezone ?: config('app.timezone');

        return Inertia::render('appointments/index', [
            'timezone' => $timezone,
            'appointments' => $team->appointments()
                ->with(['service:id,title', 'location:id,name', 'specialist:id,name', 'customer:id,name,email,phone'])
                ->orderBy('start_at')
                ->get()
                ->map(fn (Appointment $appointment): array => $this->toAppointmentArray($appointment, $timezone)),
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

        $this->createAppointment($team, $request);

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
     * Move an existing appointment to a new start time (drag-and-drop).
     *
     * The slot is re-validated against the specialist's work hours and existing
     * bookings so the appointment can never land on an unavailable time, even if
     * the client allowed the drop.
     */
    public function reschedule(Request $request, string $current_team, Appointment $appointment): RedirectResponse
    {
        $this->authorizeAppointment($request, $appointment);

        $data = $request->validate([
            'start_at' => ['required', 'date'],
        ]);

        $team = $request->user()->currentTeam;
        $timezone = $team->timezone ?: config('app.timezone');
        $start = CarbonImmutable::parse($data['start_at'])->utc();

        $available = SlotGenerator::isAvailableStart(
            $appointment->service,
            $appointment->specialist,
            $timezone,
            $start,
            $appointment->id,
        );

        if (! $available) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('That time slot is not available.')]);

            return back();
        }

        $appointment->update([
            'start_at' => $start,
            'end_at' => $start->addMinutes($appointment->service->duration),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appointment rescheduled.')]);

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
    protected function toAppointmentArray(Appointment $appointment, string $timezone): array
    {
        return [
            'id' => $appointment->id,
            'start_at' => $appointment->start_at->toIso8601String(),
            'end_at' => $appointment->end_at->toIso8601String(),
            'timezone' => $timezone,
            'notes' => $appointment->notes,
            'service' => [
                'id' => $appointment->service->id,
                'title' => $appointment->service->title,
            ],
            'location' => $appointment->location ? [
                'id' => $appointment->location->id,
                'name' => $appointment->location->name,
            ] : null,
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
