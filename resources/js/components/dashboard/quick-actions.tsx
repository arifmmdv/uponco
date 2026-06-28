import { Briefcase, CalendarPlus, MapPin, UserPlus } from 'lucide-react';
import type { ComponentType } from 'react';

import { ACCENTS  } from '@/components/dashboard/accents';
import type {Accent} from '@/components/dashboard/accents';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
    onAddAppointment: () => void;
    onAddCustomer: () => void;
    onAddService: () => void;
    onAddLocation: () => void;
};

export default function QuickActions({
    onAddAppointment,
    onAddCustomer,
    onAddService,
    onAddLocation,
}: Props) {
    return (
        <Card>
            <CardContent className="space-y-4">
                <div className="space-y-0.5">
                    <h3 className="text-base font-medium">Quick actions</h3>
                    <p className="text-sm text-muted-foreground">
                        Jump straight into the things you do most.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <QuickAction
                        icon={CalendarPlus}
                        label="New appointment"
                        accent="indigo"
                        onClick={onAddAppointment}
                    />
                    <QuickAction
                        icon={UserPlus}
                        label="Add customer"
                        accent="emerald"
                        onClick={onAddCustomer}
                    />
                    <QuickAction
                        icon={Briefcase}
                        label="Add service"
                        accent="sky"
                        onClick={onAddService}
                    />
                    <QuickAction
                        icon={MapPin}
                        label="Add location"
                        accent="rose"
                        onClick={onAddLocation}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function QuickAction({
    icon: Icon,
    label,
    accent,
    onClick,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    accent: Accent;
    onClick: () => void;
}) {
    const styles = ACCENTS[accent];

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'group flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm',
                styles.ring,
            )}
        >
            <span
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm transition-transform duration-300 group-hover:scale-105',
                    styles.gradient,
                )}
            >
                <Icon className="size-4" />
            </span>
            {label}
        </button>
    );
}
