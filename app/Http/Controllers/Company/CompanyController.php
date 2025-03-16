<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function view(): Response
    {
        return Inertia::render('company/general');
    }

    public function staff(): Response
    {
        return Inertia::render('company/staff');
    }
}
