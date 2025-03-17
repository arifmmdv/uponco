<?php

namespace App\Enums;

enum Role: string
{
    case CompanyOwner = 'company-owner';
    case Staff = 'staff';
}
