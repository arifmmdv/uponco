<?php

namespace App\Models;

use Database\Factories\WorkHourFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkHour extends Model
{
    /** @use HasFactory<WorkHourFactory> */
    use HasFactory;

    /**
     * The weekly day keys, ordered so that the array index matches `day_of_week`.
     *
     * This is the single source of truth for the `day_of_week` <-> key conversion
     * used in both directions (server -> client transform and client -> server persist).
     *
     * @var list<string>
     */
    public const DAYS = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'team_id',
        'day_of_week',
        'start_time',
        'end_time',
    ];

    /**
     * Get the user that owns the work hour.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the team the work hour applies to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
