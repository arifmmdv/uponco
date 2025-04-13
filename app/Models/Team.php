<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Laratrust\Models\Team as LaratrustTeam;

class Team extends LaratrustTeam
{
    public $guarded = [];

    public function teamMembers()
    {
        $members = User::whereHas('roles', function ($query) {
            $query->where('team_id', $this->id)->where('id', '!=', Auth::id());
        })->with('roles')->get();

        return $members->map(function ($user) {
            // Create a new array with the desired structure
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->toArray()
            ];
        });
    }
}
