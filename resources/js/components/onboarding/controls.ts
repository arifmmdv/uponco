/**
 * Navigation handlers shared by every onboarding step panel. The wizard owns
 * the active-step state and persistence; panels call these to move forward.
 */
export type StepControls = {
    showBack: boolean;
    saving: boolean;
    onBack: () => void;
    /** Mark the current step completed and advance. */
    onComplete: () => void;
    /** Mark the current step skipped and advance (optional steps only). */
    onSkip: () => void;
};
