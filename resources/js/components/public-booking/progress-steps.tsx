import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

type Props = {
    steps: string[];
    /** Zero-based index of the active step. */
    current: number;
};

/**
 * A slim progress indicator for the booking flow. Completed steps collapse to a
 * check, the active step is filled, and a connecting bar fills as you advance.
 */
export default function ProgressSteps({ steps, current }: Props) {
    return (
        <div className="flex items-center">
            {steps.map((label, index) => {
                const isComplete = index < current;
                const isActive = index === current;

                return (
                    <div
                        key={label}
                        className={cn(
                            'flex items-center',
                            index < steps.length - 1 && 'flex-1',
                        )}
                    >
                        <div
                            className={cn(
                                'flex size-7 items-center justify-center rounded-full border text-xs font-medium transition-all duration-300',
                                isComplete &&
                                    'border-primary bg-primary text-primary-foreground',
                                isActive &&
                                    'border-primary bg-primary text-primary-foreground ring-4 ring-primary/15',
                                !isComplete &&
                                    !isActive &&
                                    'border-border bg-background text-muted-foreground',
                            )}
                            aria-label={label}
                        >
                            {isComplete ? (
                                <Check className="size-3.5" />
                            ) : (
                                index + 1
                            )}
                        </div>

                        {index < steps.length - 1 && (
                            <div className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                                <div
                                    className={cn(
                                        'h-full rounded-full bg-primary transition-all duration-500 ease-out',
                                        isComplete ? 'w-full' : 'w-0',
                                    )}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
