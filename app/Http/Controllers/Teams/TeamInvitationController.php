<?php

namespace App\Http\Controllers\Teams;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teams\AcceptTeamInvitationRequest;
use App\Models\TeamInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class TeamInvitationController extends Controller
{
    /**
     * Accept the invitation.
     */
    public function accept(AcceptTeamInvitationRequest $request, TeamInvitation $invitation): RedirectResponse
    {
        $user = $request->user();

        DB::transaction(function () use ($user, $invitation) {
            $team = $invitation->team;

            $team->memberships()->firstOrCreate(
                ['user_id' => $user->id],
                ['role' => $invitation->role],
            );

            $invitation->update(['accepted_at' => now()]);

            $user->switchTeam($team);
        });

        return to_route('dashboard');
    }
}
