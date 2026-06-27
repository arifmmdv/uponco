import { Link } from '@inertiajs/react';
import { ArrowRight, Briefcase, MapPin } from 'lucide-react';
import type { ComponentType } from 'react';

import { cn } from '@/lib/utils';
import { index as locationsIndex } from '@/routes/company/locations';
import { index as servicesIndex } from '@/routes/company/services';
import type { DashboardStats } from '@/types';

const numberFormatter = new Intl.NumberFormat();

type Props = {
    stats: DashboardStats;
    teamSlug: string;
    onAddLocation: () => void;
};

export default function ResourceWidgets({
    stats,
    teamSlug,
    onAddLocation,
}: Props) {
    const hasLocations = stats.locations > 0;

    return (
        <div
            className={cn(
                'grid gap-4',
                hasLocations ? 'sm:grid-cols-2' : 'grid-cols-1',
            )}
        >
            <WidgetBar
                icon={Briefcase}
                label="Services"
                value={stats.services}
                emptyHint="Add your first service"
                href={servicesIndex.url(teamSlug)}
            />

            {hasLocations ? (
                <WidgetBar
                    icon={MapPin}
                    label="Locations"
                    value={stats.locations}
                    emptyHint="Add your first location"
                    href={locationsIndex.url(teamSlug)}
                />
            ) : (
                <button
                    type="button"
                    onClick={onAddLocation}
                    className="flex items-center justify-between gap-3 rounded-xl border border-dashed px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                    <span className="flex items-center gap-2">
                        <MapPin className="size-4" />
                        Add a location to organise bookings by branch
                    </span>
                    <ArrowRight className="size-4 shrink-0" />
                </button>
            )}
        </div>
    );
}

function WidgetBar({
    icon: Icon,
    label,
    value,
    emptyHint,
    href,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: number;
    emptyHint: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:border-primary/40"
        >
            <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-5" />
            </span>
            <div className="min-w-0">
                <p className="text-lg leading-none font-semibold">
                    {numberFormatter.format(value)}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                    {value === 0 ? emptyHint : label}
                </p>
            </div>
        </Link>
    );
}
