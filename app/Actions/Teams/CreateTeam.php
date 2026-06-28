<?php

namespace App\Actions\Teams;

use App\Enums\BusinessCategory;
use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateTeam
{
    /**
     * Create a new team and add the user as owner.
     *
     * The name may be omitted (e.g. straight after registration), in which case
     * the slug is seeded from the user's name and the team is finished later
     * during onboarding.
     */
    public function handle(User $user, ?string $name = null, bool $isPersonal = false, ?BusinessCategory $businessCategory = null): Team
    {
        return DB::transaction(function () use ($user, $name, $isPersonal, $businessCategory) {
            $team = Team::create([
                'name' => $name,
                'slug' => Team::generateUniqueTeamSlug($name ?: $user->name),
                'is_personal' => $isPersonal,
                'business_category' => $businessCategory,
            ]);

            $membership = $team->memberships()->create([
                'user_id' => $user->id,
                'role' => TeamRole::Owner,
            ]);

            $user->switchTeam($team);

            return $team;
        });
    }
}
