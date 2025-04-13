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
use App\Enums\Role;

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

    public function addUser(Request $request)
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

        $user->addRoles($request->roles, $team);

        return to_route('company.staff');
    }

    public function staff(Request $request)
    {
        $currentUserTeam = $request->user()->rolesTeams()->first();
        $teamMembers = $currentUserTeam->teamMembers();

        return Inertia::render('company/staff', [
            'teamMembers' => $teamMembers,
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
            'roles' => 'required|array', // Changed to array
            'roles.*' => 'string|in:staff,company-owner', // Validate each role in the array
        ]);

        $user = User::findOrFail($id);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        if ($request->has('roles') && !empty($request->roles)) {
            $user->syncRoles([], $team);

            $user->addRoles($request->roles, $team);
        }

        return to_route('company.staff');
    }

    public function deleteUser(Request $request, $id): RedirectResponse
    {
        $currentUserTeam = $request->user()->rolesTeams()->first();
        $currentUserRoles = $request->user()->getRoles($currentUserTeam);

        if (in_array(Role::CompanyOwner, $currentUserRoles)) {
            return to_route('company.staff')
                ->with('error', 'You do not have permission to delete team members.');
        }

        $userToDelete = User::findOrFail($id);

        // Prevent deleting yourself
        if ($userToDelete->id === $request->user()->id) {
            return to_route('company.staff')
                ->with('error', 'You cannot delete your own account.');
        }

        // Get the user's roles for this team using Laratrust's method
        $roles = $userToDelete->getRoles($currentUserTeam);

        // Remove all user's roles from the team
        if (!empty($roles)) {
            $userToDelete->removeRoles($roles, $currentUserTeam);
        }

        // Delete the user
        $userToDelete->delete();

        return to_route('company.staff')
            ->with('success', 'Team member has been deleted successfully.');
    }
}
