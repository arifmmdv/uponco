import { Check } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { AppointmentSpecialistOption } from '@/types';

type Props = {
    specialists: AppointmentSpecialistOption[];
    selectedId: number | null;
    onSelect: (specialistId: number) => void;
};

/**
 * Build initials from a specialist's name for the avatar fallback.
 */
function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

/**
 * The list of specialists. Each row previews the specialist's nearest working
 * day and a few of their work-hour time slots.
 */
export default function SpecialistPicker({
    specialists,
    selectedId,
    onSelect,
}: Props) {
    if (specialists.length === 0) {
        return (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                No specialists available.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {specialists.map((specialist) => {
                const isSelected = specialist.id === selectedId;
                const preview = specialist.next_available;

                return (
                    <button
                        key={specialist.id}
                        type="button"
                        onClick={() => onSelect(specialist.id)}
                        className={cn(
                            'flex w-full gap-3 rounded-xl border p-3 text-left transition-all duration-200',
                            isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/40',
                        )}
                    >
                        <Avatar className="size-11 shrink-0">
                            <AvatarFallback className="bg-muted text-xs font-medium">
                                {initials(specialist.name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-medium">
                                    {specialist.name}
                                </p>
                                <span
                                    className={cn(
                                        'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                        isSelected
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-muted-foreground/30',
                                    )}
                                >
                                    {isSelected && <Check className="size-3" />}
                                </span>
                            </div>

                            {preview ? (
                                <div className="mt-1.5">
                                    <p className="text-xs text-muted-foreground">
                                        Next available · {preview.label}
                                    </p>
                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                        {preview.slots
                                            .slice(0, 4)
                                            .map((slot) => (
                                                <span
                                                    key={slot}
                                                    className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                                                >
                                                    {slot}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-1 text-xs text-muted-foreground/70">
                                    No upcoming availability
                                </p>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
