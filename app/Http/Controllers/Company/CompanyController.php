<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\CompanyUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function view(Request $request): Response
    {
        $company = $request->user()->rolesTeams()->first();
        return Inertia::render('company/general', [
            'company' => $company
        ]);
    }

    public function update(CompanyUpdateRequest $request): RedirectResponse
    {
        $company = $request->user()->rolesTeams()->first();
        $company->display_name = $request->display_name;
        $company->description = $request->description;
        $company->save();

        return to_route('company.general');
    }

    public function staff(): Response
    {
        return Inertia::render('company/staff');
    }
}
