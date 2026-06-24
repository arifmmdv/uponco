<?php

namespace App\Concerns;

use App\Http\Requests\Appointments\SaveAppointmentRequest;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use App\Notifications\Appointments\AppointmentBooked;
use App\Support\Appointments\SlotGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

/**
 * Shared booking helpers used by both the dashboard and public booking flows.
 */
trait InteractsWithAppointmentBooking
{
    /**
     * Create the appointment for the request and notify the customer by email.
     *
     * The booking confirmation is only sent when the customer supplied an email
     * address; phone-only customers simply don't receive one.
     */
    protected function createAppointment(Team $team, SaveAppointmentRequest $request): Appointment
    {
        $customer = $this->resolveCustomer($team, $request->customerData());

        $appointment = $team->appointments()->create([
            ...$request->appointmentData(),
            'customer_id' => $customer->id,
        ]);

        if ($customer->email) {
            try {
                Notification::route('mail', $customer->email)
                    ->notify(new AppointmentBooked($appointment));
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return $appointment;
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
            'specialist_id' => ['required', 'integer'],
            'date' => ['required', 'date_format:Y-m-d'],
            'appointment_id' => ['nullable', 'integer'],
        ]);

        $service = $team->services()->whereKey($data['service_id'])->first();
        $specialist = $team->members()->whereKey($data['specialist_id'])->first();

        if (! $service instanceof Service || ! $specialist instanceof User) {
            return [];
        }

        return SlotGenerator::generate(
            $service,
            $specialist,
            $team->timezone ?: config('app.timezone'),
            $data['date'],
            $data['appointment_id'] ?? null,
        );
    }
}
