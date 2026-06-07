import { Fragment } from 'react';
import type { FormEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { DayKey, WeeklySchedule } from '@/types/work-hours';
import { DAY_KEYS } from '@/types/work-hours';
import DayRow from './day-row';
import ScheduleFooter from './schedule-footer';
import ScheduleHeader from './schedule-header';

export type WeeklyScheduleProps = {
    schedule: WeeklySchedule;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onToggleDay: (day: DayKey, enabled: boolean) => void;
    onAddSlot: (day: DayKey) => void;
    onRemoveSlot: (day: DayKey, index: number) => void;
    onUpdateSlot: (
        day: DayKey,
        index: number,
        field: 'start' | 'end',
        value: string,
    ) => void;
    onCopyMondayToAll: () => void;
    onDiscard: () => void;
};

function canCopyMonday(schedule: WeeklySchedule): boolean {
    const monday = schedule.monday;

    return (
        monday.enabled &&
        monday.slots.length > 0 &&
        monday.slots.every((slot) => slot.start !== '' && slot.end !== '')
    );
}

export default function WeeklySchedule({
    schedule,
    errors,
    processing,
    onSubmit,
    onToggleDay,
    onAddSlot,
    onRemoveSlot,
    onUpdateSlot,
    onCopyMondayToAll,
    onDiscard,
}: WeeklyScheduleProps) {
    return (
        <form onSubmit={onSubmit}>
            <Card>
                <CardContent className="space-y-2">
                    <ScheduleHeader
                        canCopyMonday={canCopyMonday(schedule)}
                        onCopyMondayToAll={onCopyMondayToAll}
                    />

                    <Separator />

                    <div className="divide-y divide-border">
                        {DAY_KEYS.map((day) => (
                            <Fragment key={day}>
                                <DayRow
                                    day={day}
                                    schedule={schedule[day]}
                                    errors={errors}
                                    onToggle={onToggleDay}
                                    onAddSlot={onAddSlot}
                                    onRemoveSlot={onRemoveSlot}
                                    onUpdateSlot={onUpdateSlot}
                                />
                            </Fragment>
                        ))}
                    </div>

                    <Separator />

                    <ScheduleFooter
                        processing={processing}
                        onDiscard={onDiscard}
                    />
                </CardContent>
            </Card>
        </form>
    );
}
