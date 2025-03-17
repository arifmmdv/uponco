<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Laratrust\Traits\HasRolesAndPermissions;
use Laratrust\Contracts\LaratrustUser;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail, LaratrustUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;
    use HasRolesAndPermissions;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function teamMembers()
    {
        return User::whereHas('roles', function ($query) {
            $query->whereIn('team_id', function ($subquery) {
                $subquery->select('team_id')
                    ->from('role_user')
                    ->where('user_id', $this->id)
                    ->whereNotNull('team_id');
            });
        })->where('id', '!=', $this->id)->get();
    }

    /**
     * Get the first team the user is assigned to.
     *
     * @return HasOne
     */
    public function firstTeam()
    {
        $teamId = DB::table('role_user')
            ->where('user_id', $this->id)
            ->whereNotNull('team_id')
            ->value('team_id');

        return $teamId ? Team::find($teamId) : null;
    }

    /**
     * Get the team the user is assigned to.
     *
     * @return BelongsToMany
     */
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'role_user', 'user_id', 'team_id')
            ->wherePivot('user_type', User::class);
    }
}
