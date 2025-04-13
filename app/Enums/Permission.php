<?php

namespace App\Enums;

enum Permission: string
{
    case ListStaff = 'list-staff';
    case EditStaff = 'edit-staff';
    case DeleteStaff = 'delete-staff';
    case EditCompany = 'edit-company';
}
