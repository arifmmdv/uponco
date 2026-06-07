import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import WeeklySchedule from '@/components/work-hours/weekly-schedule';
import { edit, update } from '@/routes/work-hours';
import type {
    DayKey,
    TimeSlot,
    WeeklySchedule as WeeklyScheduleType,
} from '@/types/work-hours';
import { DAY_KEYS } from '@/types/work-hours';

const DEFAULT_SLOT: TimeSlot = { start: '09:00', end: '17:00' };

type WorkHoursPageProps = {
    schedule: WeeklyScheduleType;
};

export default function WorkHours({ schedule }: WorkHoursPageProps) {
    const form = useForm<{ schedule: WeeklyScheduleType }>({ schedule });

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
        setSchedule((current) => ({
            ...current,
            [day]: producer(current[day]),
        }));
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

        form.put(update().url, {
            preserveScroll: true,
            onSuccess: () => toast.success('Work hours saved.'),
            onError: () => toast.error('Please fix the errors and try again.'),
        });
    };

    return (
        <>
            <Head title="Work hours settings" />

            <h1 className="sr-only">Work hours settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Work hours"
                    description="Set your weekly availability"
                />

                <WeeklySchedule
                    schedule={form.data.schedule}
                    errors={form.errors as Record<string, string>}
                    processing={form.processing}
                    onSubmit={handleSubmit}
                    onToggleDay={toggleDay}
                    onAddSlot={addSlot}
                    onRemoveSlot={removeSlot}
                    onUpdateSlot={updateSlot}
                    onCopyMondayToAll={copyMondayToAll}
                    onDiscard={discard}
                />
            </div>
        </>
    );
}

WorkHours.layout = {
    breadcrumbs: [
        {
            title: 'Work hours settings',
            href: edit(),
        },
    ],
};
