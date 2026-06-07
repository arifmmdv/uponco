import { Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DayKey, TimeSlot } from '@/types/work-hours';

type TimeSlotRowProps = {
    day: DayKey;
    index: number;
    slot: TimeSlot;
    startError?: string;
    endError?: string;
    onUpdate: (
        day: DayKey,
        index: number,
        field: 'start' | 'end',
        value: string,
    ) => void;
    onRemove: (day: DayKey, index: number) => void;
};

export default function TimeSlotRow({
    day,
    index,
    slot,
    startError,
    endError,
    onUpdate,
    onRemove,
}: TimeSlotRowProps) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <Input
                    type="time"
                    aria-label={`${day} start time ${index + 1}`}
                    value={slot.start}
                    onChange={(event) =>
                        onUpdate(day, index, 'start', event.target.value)
                    }
                    className="w-32"
                />

                <span className="text-sm text-muted-foreground">to</span>

                <Input
                    type="time"
                    aria-label={`${day} end time ${index + 1}`}
                    value={slot.end}
                    onChange={(event) =>
                        onUpdate(day, index, 'end', event.target.value)
                    }
                    className="w-32"
                />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove time block ${index + 1}`}
                    onClick={() => onRemove(day, index)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <InputError message={startError} />
            <InputError message={endError} />
        </div>
    );
}
