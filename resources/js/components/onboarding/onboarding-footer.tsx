import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    showBack: boolean;
    onBack: () => void;
    saving: boolean;
    /** When provided, renders a Skip button for optional steps. */
    onSkip?: () => void;
    skipLabel?: string;
    continueLabel?: string;
    continueDisabled?: boolean;
    /**
     * When provided, the continue button is a plain button calling this handler.
     * When omitted, the continue button submits the surrounding form.
     */
    onContinue?: () => void;
};

export default function OnboardingFooter({
    showBack,
    onBack,
    saving,
    onSkip,
    skipLabel = 'Skip for now',
    continueLabel = 'Continue',
    continueDisabled = false,
    onContinue,
}: Props) {
    return (
        <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
                {showBack ? (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onBack}
                        disabled={saving}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </Button>
                ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
                {onSkip ? (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onSkip}
                        disabled={saving}
                        data-test="onboarding-skip"
                    >
                        {skipLabel}
                    </Button>
                ) : null}

                <Button
                    type={onContinue ? 'button' : 'submit'}
                    onClick={onContinue}
                    disabled={continueDisabled || saving}
                    data-test="onboarding-continue"
                >
                    {saving ? <Spinner /> : null}
                    {continueLabel}
                </Button>
            </div>
        </div>
    );
}
