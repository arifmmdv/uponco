import { CalendarCheck, CalendarClock, Users } from 'lucide-react';

import StatCard from '@/components/dashboard/stat-card';
import { index as appointmentsIndex } from '@/routes/appointments';
import { index as customersIndex } from '@/routes/customers';
import type { DashboardStats as Stats } from '@/types';

type Props = {
    stats: Stats;
    teamSlug: string;
    mounted: boolean;
};

export default function DashboardStats({ stats, teamSlug, mounted }: Props) {
    const cards = [
        {
            icon: Users,
            label: 'Customers',
            value: stats.customers,
            href: customersIndex.url(teamSlug),
            accent: 'indigo' as const,
            hint: 'No customers yet',
        },
        {
            icon: CalendarCheck,
            label: 'Total bookings',
            value: stats.totalBookings,
            href: appointmentsIndex.url(teamSlug),
            accent: 'emerald' as const,
            hint: 'No bookings yet',
        },
        {
            icon: CalendarClock,
            label: 'Upcoming',
            value: stats.upcoming,
            href: appointmentsIndex.url(teamSlug),
            accent: 'amber' as const,
            hint: 'Nothing upcoming',
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {cards.map((card, index) => (
                <StatCard
                    key={card.label}
                    icon={card.icon}
                    label={card.label}
                    value={card.value}
                    href={card.href}
                    accent={card.accent}
                    hint={card.hint}
                    mounted={mounted}
                    delay={index * 60}
                />
            ))}
        </div>
    );
}
