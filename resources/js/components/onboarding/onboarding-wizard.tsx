import { router, usePage } from '@inertiajs/react';
import { Check, Minus } from 'lucide-react';
import { useMemo, useState } from 'react';
import OnboardingController from '@/actions/App/Http/Controllers/OnboardingController';
import { cn } from '@/lib/utils';
import type { Onboarding, OnboardingStepKey } from '@/types';
import type { StepControls } from './controls';
import StepGeneral from './step-general';
import StepLocations from './step-locations';
import StepMembers from './step-members';
import StepProfile from './step-profile';
import StepServices from './step-services';
import StepWorkHours from './step-work-hours';

type Props = {
    onboarding: Onboarding;
};

export default function OnboardingWizard({ onboarding }: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const { steps } = onboarding;

    const [activeStep, setActiveStep] = useState<OnboardingStepKey>(
        onboarding.currentStep,
    );
    const [saving, setSaving] = useState(false);

    const activeIndex = useMemo(
        () => steps.findIndex((step) => step.key === activeStep),
        [steps, activeStep],
    );

    const completedCount = steps.filter(
        (step) => step.status !== 'pending',
    ).length;

    const goTo = (index: number): void => {
        const target = steps[index];
        if (target) {
            setActiveStep(target.key);
        }
    };

    const persist = (status: 'completed' | 'skipped'): void => {
        setSaving(true);
        router.patch(
            OnboardingController.update([teamSlug, activeStep]).url,
            { status },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => goTo(activeIndex + 1),
                onFinish: () => setSaving(false),
            },
        );
    };

    const controls: StepControls = {
        showBack: activeIndex > 0,
        saving,
        onBack: () => goTo(activeIndex - 1),
        onComplete: () => persist('completed'),
        onSkip: () => persist('skipped'),
    };

    const selectStep = (key: OnboardingStepKey): void => {
        const target = steps.find((step) => step.key === key);
        if (target && (target.status !== 'pending' || key === activeStep)) {
            setActiveStep(key);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Finish setting up your business
                </h1>
                <p className="text-muted-foreground">
                    Complete these steps so you can start taking bookings.{' '}
                    <span className="font-medium text-foreground">
                        {completedCount} of {steps.length} done
                    </span>
                    .
                </p>
            </div>

            <ol className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {steps.map((step, index) => {
                    const isActive = step.key === activeStep;
                    const isCompleted = step.status === 'completed';
                    const isSkipped = step.status === 'skipped';
                    const isClickable = step.status !== 'pending' || isActive;

                    return (
                        <li key={step.key} className="shrink-0">
                            <button
                                type="button"
                                disabled={!isClickable}
                                onClick={() => selectStep(step.key)}
                                data-test={`onboarding-tab-${step.key}`}
                                className={cn(
                                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm whitespace-nowrap transition-colors',
                                    isActive
                                        ? 'border-primary bg-primary/5 text-foreground'
                                        : 'border-border text-muted-foreground',
                                    isClickable && !isActive
                                        ? 'hover:bg-accent'
                                        : '',
                                    !isClickable ? 'opacity-60' : '',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium',
                                        isCompleted
                                            ? 'bg-primary text-primary-foreground'
                                            : isSkipped
                                              ? 'bg-muted text-muted-foreground'
                                              : isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-3 w-3" />
                                    ) : isSkipped ? (
                                        <Minus className="h-3 w-3" />
                                    ) : (
                                        index + 1
                                    )}
                                </span>
                                {step.label}
                                {step.mandatory ? (
                                    <span className="text-destructive">*</span>
                                ) : null}
                            </button>
                        </li>
                    );
                })}
            </ol>

            <div className="rounded-xl border p-5 sm:p-6">
                {activeStep === 'general' ? (
                    <StepGeneral data={onboarding.general} controls={controls} />
                ) : null}
                {activeStep === 'members' ? (
                    <StepMembers data={onboarding.members} controls={controls} />
                ) : null}
                {activeStep === 'locations' ? (
                    <StepLocations
                        data={onboarding.locations}
                        controls={controls}
                    />
                ) : null}
                {activeStep === 'services' ? (
                    <StepServices
                        data={onboarding.services}
                        controls={controls}
                    />
                ) : null}
                {activeStep === 'profile' ? (
                    <StepProfile data={onboarding.profile} controls={controls} />
                ) : null}
                {activeStep === 'work_hours' ? (
                    <StepWorkHours
                        data={onboarding.workHours}
                        controls={controls}
                    />
                ) : null}
            </div>
        </div>
    );
}
