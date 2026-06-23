<?php

namespace App\Http\Requests\Appointments;

use App\Models\Team;

/**
 * Validates a booking submitted from the public, unauthenticated booking page.
 *
 * The team is resolved from the {company} route binding rather than the
 * authenticated user's current team, but every availability and ownership
 * check is otherwise identical to the dashboard flow.
 */
class BookPublicAppointmentRequest extends SaveAppointmentRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the team the appointment belongs to.
     */
    protected function team(): Team
    {
        return $this->route('company');
    }
}
