import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
    step: number;
    canContinue: boolean;
    processing: boolean;
    onBack: () => void;
    onContinue: () => void;
    onSubmit: () => void;
};

/**
 * Sticky bottom navigation: back button plus the step-aware primary action
 * (Continue on steps 0–1, Confirm booking on the final step).
 */
export default function BookingFooter({
    step,
    canContinue,
    processing,
    onBack,
    onContinue,
    onSubmit,
}: Props) {
    return (
        <footer className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[460px] items-center gap-3 border-t bg-background/95 px-5 py-3.5 backdrop-blur">
            {step > 0 && (
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-[50px] shrink-0"
                    onClick={onBack}
                    aria-label="Back"
                >
                    <ArrowLeft className="size-5" />
                </Button>
            )}

            {step < 2 ? (
                <Button
                    type="button"
                    className="h-[50px] flex-1 text-base"
                    disabled={!canContinue}
                    onClick={onContinue}
                >
                    Continue
                </Button>
            ) : (
                <Button
                    type="button"
                    className="h-[50px] flex-1 text-base"
                    disabled={processing}
                    onClick={onSubmit}
                    data-test="appointment-save-button"
                >
                    Confirm booking
                </Button>
            )}
        </footer>
    );
}
