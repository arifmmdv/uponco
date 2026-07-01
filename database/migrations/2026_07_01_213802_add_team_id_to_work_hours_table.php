<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Work hours are now scoped per team so a user who belongs to multiple teams
     * can keep a distinct weekly schedule for each. Existing rows are backfilled
     * onto the owner's current team; any that cannot be attributed are dropped.
     */
    public function up(): void
    {
        Schema::table('work_hours', function (Blueprint $table): void {
            $table->foreignId('team_id')
                ->nullable()
                ->after('user_id')
                ->constrained()
                ->cascadeOnDelete();
        });

        DB::table('work_hours')->update([
            'team_id' => DB::raw('(SELECT current_team_id FROM users WHERE users.id = work_hours.user_id)'),
        ]);

        DB::table('work_hours')->whereNull('team_id')->delete();

        Schema::table('work_hours', function (Blueprint $table): void {
            $table->index(['user_id', 'team_id', 'day_of_week']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_hours', function (Blueprint $table): void {
            $table->dropIndex(['user_id', 'team_id', 'day_of_week']);
            $table->dropConstrainedForeignId('team_id');
        });
    }
};
