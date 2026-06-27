<?php

use App\Enums\OnboardingStep;
use App\Enums\OnboardingStepStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('onboarding_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            foreach (OnboardingStep::cases() as $step) {
                $table->string($step->column())->default(OnboardingStepStatus::Pending->value);
            }

            $table->string('current_step')->default(OnboardingStep::General->value);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['team_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('onboarding_progress');
    }
};
