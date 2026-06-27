import { Briefcase, CalendarPlus, MapPin, UserPlus } from 'lucide-react';
import type { ComponentType } from 'react';

import { Card, CardContent } from '@/components/ui/card';

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
                        onClick={onAddAppointment}
                    />
                    <QuickAction
                        icon={UserPlus}
                        label="Add customer"
                        onClick={onAddCustomer}
                    />
                    <QuickAction
                        icon={Briefcase}
                        label="Add service"
                        onClick={onAddService}
                    />
                    <QuickAction
                        icon={MapPin}
                        label="Add location"
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
    onClick,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/50"
        >
            <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="size-4" />
            </span>
            {label}
        </button>
    );
}
