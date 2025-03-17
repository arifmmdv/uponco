<?php

namespace App\Models;

use Laratrust\Models\Team as LaratrustTeam;

class Team extends LaratrustTeam
{
    public $guarded = [];

    public function users()
    {
        return User::whereHas('roles', function ($query) {
            $query->where('team_id', $this->id);
        })->get();
    }
}
