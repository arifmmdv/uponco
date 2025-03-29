<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\CompanyUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\DB;

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
        $team = $request->user()->rolesTeams()->first();
        $teamMembers = $request->user()->teamMembers();

        // Get all users' roles in this team
        $userRoles = DB::table('role_user')
            ->join('roles', 'role_user.role_id', '=', 'roles.id')
            ->where('role_user.team_id', $team->id)
            ->select('role_user.user_id', 'roles.name as role_name')
            ->get()
            ->keyBy('user_id');

        // Enhance each team member with their role
        $teamMembers = $teamMembers->map(function($user) use ($userRoles) {
            $userData = $user->toArray();
            $userData['role'] = $userRoles->get($user->id)->role_name ?? 'staff';
            $userData['id'] = (string)$user->id; // Ensure ID is a string
            return $userData;
        });

        return Inertia::render('company/staff', [
            'teamMembers' => $teamMembers
        ]);
    }

    public function updateUser(Request $request, $id): RedirectResponse
    {
        $team = $request->user()->rolesTeams()->first();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users')->ignore($id),
            ],
            'role' => 'required|string|in:staff,company-owner',
        ]);

        $user = User::findOrFail($id);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        // Only update role if it has changed
        if ($request->has('role') && $request->filled('role')) {
            // Remove current role and add the new one
            $user->removeRole($team);
            $user->addRole($request->role, $team);
        }

        return to_route('company.staff');
    }

    public function deleteUser(Request $request): RedirectResponse
    {
        $team = $request->user()->rolesTeams()->first();

        $request->validate([
            'id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->id);

        // Remove user from the team and delete
        $user->removeRole($team);
        $user->delete();

        return to_route('company.staff');
    }
}
