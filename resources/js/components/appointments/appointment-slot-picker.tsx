import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { todayDateInputValue } from '@/lib/appointments';
import { cn } from '@/lib/utils';
import type { AppointmentSlot } from '@/types';

type Props = {
    date: string;
    onDateChange: (date: string) => void;
    slots: AppointmentSlot[];
    loading: boolean;
    selectedStart: string;
    onSelectSlot: (start: string) => void;
    /** True until a service and specialist are both chosen. */
    selectionIncomplete: boolean;
    error?: string;
};

export default function AppointmentSlotPicker({
    date,
    onDateChange,
    slots,
    loading,
    selectedStart,
    onSelectSlot,
    selectionIncomplete,
    error,
}: Props) {
    return (
        <div className="grid gap-2">
            <Label htmlFor="appointment-date">Date</Label>
            <Input
                id="appointment-date"
                type="date"
                value={date}
                min={todayDateInputValue()}
                disabled={selectionIncomplete}
                onChange={(event) => onDateChange(event.target.value)}
                data-test="appointment-date-input"
            />

            <div className="mt-1">
                {selectionIncomplete ? (
                    <p className="text-sm text-muted-foreground">
                        Select a service and specialist to see available times.
                    </p>
                ) : !date ? (
                    <p className="text-sm text-muted-foreground">
                        Pick a date to see available times.
                    </p>
                ) : loading ? (
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} className="h-9 w-full" />
                        ))}
                    </div>
                ) : slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No available times on this day.
                    </p>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                            <button
                                key={slot.start}
                                type="button"
                                disabled={!slot.available}
                                aria-pressed={selectedStart === slot.start}
                                onClick={() => onSelectSlot(slot.start)}
                                data-test="appointment-slot"
                                className={cn(
                                    'rounded-md border px-2 py-2 text-sm transition-colors',
                                    'hover:border-ring disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 disabled:hover:border-input',
                                    selectedStart === slot.start &&
                                        'border-primary bg-primary-gradient text-primary-foreground hover:border-primary',
                                )}
                            >
                                {slot.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <InputError message={error} />
        </div>
    );
}
