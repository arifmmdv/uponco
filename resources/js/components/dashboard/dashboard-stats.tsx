import { CalendarCheck, CalendarClock, Users } from 'lucide-react';

import StatCard from '@/components/dashboard/stat-card';
import { index as appointmentsIndex } from '@/routes/appointments';
import { index as customersIndex } from '@/routes/customers';
import type { DashboardStats as Stats } from '@/types';

type Props = {
    stats: Stats;
    teamSlug: string;
};

export default function DashboardStats({ stats, teamSlug }: Props) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
                icon={Users}
                label="Customers"
                value={stats.customers}
                href={customersIndex.url(teamSlug)}
            />
            <StatCard
                icon={CalendarCheck}
                label="Total bookings"
                value={stats.totalBookings}
                href={appointmentsIndex.url(teamSlug)}
            />
            <StatCard
                icon={CalendarClock}
                label="Upcoming"
                value={stats.upcoming}
                href={appointmentsIndex.url(teamSlug)}
            />
        </div>
    );
}
