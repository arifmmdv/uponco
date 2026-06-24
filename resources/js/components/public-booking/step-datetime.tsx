import InputError from '@/components/input-error';
import { Skeleton } from '@/components/ui/skeleton';
import type { UpcomingDay } from '@/lib/appointments';
import { cn } from '@/lib/utils';
import type { AppointmentSlot } from '@/types';

type Props = {
    days: UpcomingDay[];
    date: string;
    onDateChange: (date: string) => void;
    timezone: string;
    slots: AppointmentSlot[];
    loading: boolean;
    selectedStart: string;
    onSelectSlot: (start: string) => void;
    error?: string;
};

/**
 * Step two: pick a day from the horizontal strip, then a time slot. Time slots
 * are generated server-side for the chosen service, specialist and day.
 */
export default function StepDateTime({
    days,
    date,
    onDateChange,
    timezone,
    slots,
    loading,
    selectedStart,
    onSelectSlot,
    error,
}: Props) {
    const timeFormatter = new Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
    });

    const availableSlots = slots.filter((slot) => slot.available);

    return (
        <div className="space-y-6">
            <section className="space-y-3">
                <h2 className="text-sm font-medium">Choose a day</h2>

                <div className="-mx-1 flex [scrollbar-width:thin] [scrollbar-color:var(--color-primary)_transparent] gap-2 overflow-x-auto px-1 pt-1 pb-3 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/70 [&::-webkit-scrollbar-track]:bg-transparent">
                    {days.map((day) => {
                        const isSelected = day.date === date;

                        return (
                            <button
                                key={day.date}
                                type="button"
                                onClick={() => onDateChange(day.date)}
                                className={cn(
                                    'flex w-14 shrink-0 flex-col items-center rounded-xl border py-2.5 transition-all duration-200',
                                    isSelected
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-card hover:border-primary/40',
                                )}
                            >
                                <span
                                    className={cn(
                                        'text-[11px]',
                                        isSelected
                                            ? 'text-primary-foreground/80'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {day.isToday
                                        ? 'Today'
                                        : day.isTomorrow
                                          ? 'Tmrw'
                                          : day.weekday}
                                </span>
                                <span className="text-lg font-semibold">
                                    {day.day}
                                </span>
                                <span
                                    className={cn(
                                        'text-[11px]',
                                        isSelected
                                            ? 'text-primary-foreground/80'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {day.month}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-sm font-medium">Choose a time</h2>

                {loading ? (
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 9 }).map((_, index) => (
                            <Skeleton key={index} className="h-10 w-full" />
                        ))}
                    </div>
                ) : availableSlots.length === 0 ? (
                    <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
                        No times available on this day. Try another.
                    </p>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => {
                            const isSelected = slot.start === selectedStart;

                            return (
                                <button
                                    key={slot.start}
                                    type="button"
                                    onClick={() => onSelectSlot(slot.start)}
                                    className={cn(
                                        'rounded-lg border py-2.5 text-sm font-medium transition-all duration-200',
                                        isSelected
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-card hover:border-primary/40',
                                    )}
                                >
                                    {timeFormatter.format(new Date(slot.start))}
                                </button>
                            );
                        })}
                    </div>
                )}

                <InputError message={error} />
            </section>
        </div>
    );
}
