<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Laratrust\Models\Team as LaratrustTeam;

class Team extends LaratrustTeam
{
    public $guarded = [];

    public function teamMembers()
    {
        return User::whereHas('roles', function ($query) {
            $query->where('team_id', $this->id)->where('id', '!=', Auth::id());
        })->with(['roles' => function ($query) {
            $query->select('name'); // Select only the 'name' attribute
        }])->get();
    }
}
