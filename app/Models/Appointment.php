<?php

namespace App\Models;

use App\Enums\DeliveryType;
use Database\Factories\AppointmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'team_id',
    'service_id',
    'location_id',
    'specialist_id',
    'customer_id',
    'start_at',
    'end_at',
    'delivery_type',
    'online_meeting_provider',
    'meeting_url',
    'client_comment',
    'notes',
])]
class Appointment extends Model
{
    /** @use HasFactory<AppointmentFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the team that owns the appointment.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the booked service.
     *
     * @return BelongsTo<Service, $this>
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the location (branch) where the appointment takes place.
     *
     * @return BelongsTo<Location, $this>
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the specialist providing the service.
     *
     * @return BelongsTo<User, $this>
     */
    public function specialist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'specialist_id');
    }

    /**
     * Get the customer the appointment is for.
     *
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'delivery_type' => DeliveryType::class,
        ];
    }
}
