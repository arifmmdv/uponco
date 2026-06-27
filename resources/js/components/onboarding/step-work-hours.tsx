import { useForm, usePage } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import WeeklySchedule from '@/components/work-hours/weekly-schedule';
import { update as updateWorkHours } from '@/routes/company/work-hours';
import type { Onboarding } from '@/types';
import type {
    DayKey,
    WeeklySchedule as WeeklyScheduleType,
} from '@/types/work-hours';
import { DAY_KEYS } from '@/types/work-hours';
import type { StepControls } from './controls';

const DEFAULT_SLOT = { start: '09:00', end: '17:00' };

type Props = {
    data: Onboarding['workHours'];
    controls: StepControls;
};

export default function StepWorkHours({ data, controls }: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const form = useForm<{ schedule: WeeklyScheduleType }>({
        schedule: data.schedule,
    });

    const setSchedule = (
        producer: (current: WeeklyScheduleType) => WeeklyScheduleType,
    ): void => {
        form.setData('schedule', producer(form.data.schedule));
    };

    const updateDay = (
        day: DayKey,
        producer: (
            current: WeeklyScheduleType[DayKey],
        ) => WeeklyScheduleType[DayKey],
    ): void => {
        setSchedule((current) => ({ ...current, [day]: producer(current[day]) }));
    };

    const toggleDay = (day: DayKey, enabled: boolean): void => {
        updateDay(day, (current) => ({
            enabled,
            slots:
                enabled && current.slots.length === 0
                    ? [{ ...DEFAULT_SLOT }]
                    : current.slots,
        }));
    };

    const addSlot = (day: DayKey): void => {
        updateDay(day, (current) => ({
            ...current,
            slots: [...current.slots, { start: '', end: '' }],
        }));
    };

    const removeSlot = (day: DayKey, index: number): void => {
        updateDay(day, (current) => ({
            ...current,
            slots: current.slots.filter((_, slotIndex) => slotIndex !== index),
        }));
    };

    const updateSlot = (
        day: DayKey,
        index: number,
        field: 'start' | 'end',
        value: string,
    ): void => {
        updateDay(day, (current) => ({
            ...current,
            slots: current.slots.map((slot, slotIndex) =>
                slotIndex === index ? { ...slot, [field]: value } : slot,
            ),
        }));
    };

    const copyMondayToAll = (): void => {
        setSchedule((current) => {
            const next = { ...current };
            for (const day of DAY_KEYS) {
                if (day === 'monday' || !next[day].enabled) {
                    continue;
                }
                next[day] = {
                    ...next[day],
                    slots: current.monday.slots.map((slot) => ({ ...slot })),
                };
            }
            return next;
        });
    };

    const discard = (): void => {
        form.reset();
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        const hasEnabledDay = DAY_KEYS.some(
            (day) => form.data.schedule[day].enabled,
        );

        if (!hasEnabledDay) {
            toast.error('Add at least one working day to continue.');
            return;
        }

        form.put(updateWorkHours(teamSlug).url, {
            preserveScroll: true,
            onSuccess: () => controls.onComplete(),
            onError: () => toast.error('Please fix the errors and try again.'),
        });
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Set the hours you accept bookings. Add at least one working day
                to finish setup.
            </p>

            <WeeklySchedule
                schedule={form.data.schedule}
                errors={form.errors as Record<string, string>}
                processing={form.processing || controls.saving}
                onSubmit={handleSubmit}
                onToggleDay={toggleDay}
                onAddSlot={addSlot}
                onRemoveSlot={removeSlot}
                onUpdateSlot={updateSlot}
                onCopyMondayToAll={copyMondayToAll}
                onDiscard={discard}
            />

            {controls.showBack ? (
                <div className="border-t pt-5">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={controls.onBack}
                        disabled={controls.saving}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
