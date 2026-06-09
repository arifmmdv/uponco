<?php

namespace App\Http\Controllers\Company;

use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teams\UpdateTeamMemberRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class BusinessMemberController extends Controller
{
    /**
     * Update the specified current team member's role.
     */
    public function update(UpdateTeamMemberRequest $request, string $current_team, User $user): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('updateMember', $team);

        $newRole = TeamRole::from($request->validated('role'));

        $team->memberships()
            ->where('user_id', $user->id)
            ->firstOrFail()
            ->update(['role' => $newRole]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Member role updated.')]);

        return back();
    }

    /**
     * Remove the specified member from the current team.
     */
    public function destroy(Request $request, string $current_team, User $user): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('removeMember', $team);

        abort_if($team->owner()?->is($user), 403, __('The team owner cannot be removed.'));

        $team->memberships()
            ->where('user_id', $user->id)
            ->delete();

        if ($user->isCurrentTeam($team)) {
            $user->switchTeam($user->personalTeam());
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Member removed.')]);

        return back();
    }
}
