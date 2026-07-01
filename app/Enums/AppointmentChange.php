<?php

namespace App\Enums;

/**
 * Whether an appointment notification is announcing a brand-new booking or a
 * change to an existing one. Drives the wording of the customer email so it is
 * always clear what happened.
 */
enum AppointmentChange: string
{
    case Created = 'created';
    case Updated = 'updated';
}
