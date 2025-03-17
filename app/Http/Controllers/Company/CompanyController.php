<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\CompanyUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rules;

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

    public function addUser(Request $request): RedirectResponse
    {
        $team = $request->user()->rolesTeams()->first();
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->addRole($request->role, $team);

//       Check how to inform user more Laravel way
//        event(new Registered($user));

        return to_route('company.staff');
    }

    public function staff(Request $request)
    {
        return Inertia::render('company/staff', [
            'teamMembers' => $request->user()->teamMembers()
        ]);
    }
}
