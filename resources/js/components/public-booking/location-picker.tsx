import { Check, MapPin } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { AppointmentLocationOption } from '@/types';

type Props = {
    locations: AppointmentLocationOption[];
    selectedId: number | null;
    onSelect: (locationId: number) => void;
};

/**
 * A simple stacked list of the company's locations.
 */
export default function LocationPicker({
    locations,
    selectedId,
    onSelect,
}: Props) {
    if (locations.length === 0) {
        return (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                No locations available.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {locations.map((location) => {
                const isSelected = location.id === selectedId;

                return (
                    <button
                        key={location.id}
                        type="button"
                        onClick={() => onSelect(location.id)}
                        className={cn(
                            'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200',
                            isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/40',
                        )}
                    >
                        <span
                            className={cn(
                                'flex size-9 shrink-0 items-center justify-center rounded-full transition-colors',
                                isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground',
                            )}
                        >
                            <MapPin className="size-4" />
                        </span>

                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {location.name}
                        </span>

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
                    </button>
                );
            })}
        </div>
    );
}
