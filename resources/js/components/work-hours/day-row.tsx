import { Plus } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { DayKey, DaySchedule } from '@/types/work-hours';
import { DAY_LABELS } from '@/types/work-hours';
import TimeSlotRow from './time-slot-row';

type DayRowProps = {
    day: DayKey;
    schedule: DaySchedule;
    errors: Record<string, string>;
    onToggle: (day: DayKey, enabled: boolean) => void;
    onAddSlot: (day: DayKey) => void;
    onRemoveSlot: (day: DayKey, index: number) => void;
    onUpdateSlot: (
        day: DayKey,
        index: number,
        field: 'start' | 'end',
        value: string,
    ) => void;
};

export default function DayRow({
    day,
    schedule,
    errors,
    onToggle,
    onAddSlot,
    onRemoveSlot,
    onUpdateSlot,
}: DayRowProps) {
    return (
        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:gap-6">
            <div className="flex w-40 shrink-0 items-center gap-3">
                <Switch
                    id={`toggle-${day}`}
                    checked={schedule.enabled}
                    onCheckedChange={(checked) => onToggle(day, checked)}
                    aria-label={`Toggle ${DAY_LABELS[day]}`}
                />
                <Label htmlFor={`toggle-${day}`} className="cursor-pointer">
                    {DAY_LABELS[day]}
                </Label>
            </div>

            <div className="flex-1 space-y-3">
                {schedule.enabled ? (
                    <>
                        {schedule.slots.map((slot, index) => (
                            <TimeSlotRow
                                key={index}
                                day={day}
                                index={index}
                                slot={slot}
                                startError={
                                    errors[
                                        `schedule.${day}.slots.${index}.start`
                                    ]
                                }
                                endError={
                                    errors[`schedule.${day}.slots.${index}.end`]
                                }
                                onUpdate={onUpdateSlot}
                                onRemove={onRemoveSlot}
                            />
                        ))}

                        <InputError message={errors[`schedule.${day}.slots`]} />

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onAddSlot(day)}
                        >
                            <Plus className="h-4 w-4" />
                            Add Time Block
                        </Button>
                    </>
                ) : (
                    <p className="py-2 text-sm text-muted-foreground">
                        Unavailable
                    </p>
                )}
            </div>
        </div>
    );
}
