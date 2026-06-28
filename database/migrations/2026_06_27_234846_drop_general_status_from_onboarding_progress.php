<?php

use App\Enums\OnboardingStep;
use App\Enums\OnboardingStepStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The "general" onboarding step has been folded into the dedicated onboard
     * gate, so its status column is no longer needed and the default starting
     * step becomes "locations".
     */
    public function up(): void
    {
        DB::table('onboarding_progress')
            ->where('current_step', 'general')
            ->update(['current_step' => OnboardingStep::Locations->value]);

        Schema::table('onboarding_progress', function (Blueprint $table) {
            $table->dropColumn('general_status');
            $table->string('current_step')->default(OnboardingStep::Locations->value)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('onboarding_progress', function (Blueprint $table) {
            $table->string('general_status')->default(OnboardingStepStatus::Pending->value)->after('user_id');
            $table->string('current_step')->default('general')->change();
        });
    }
};
