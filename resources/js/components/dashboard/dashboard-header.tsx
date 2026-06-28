import { CalendarPlus, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { show as bookingPage } from '@/routes/public/appointments';

type Props = {
    firstName: string;
    teamSlug: string;
    onAddAppointment: () => void;
};

export default function DashboardHeader({
    firstName,
    teamSlug,
    onAddAppointment,
}: Props) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
                <h2 className="text-xl font-semibold tracking-tight">
                    Welcome back,{' '}
                    <span className="bg-gradient-to-r from-[#0063ff] to-[#3884fe] bg-clip-text text-transparent">
                        {firstName}
                    </span>
                </h2>
                <p className="text-sm text-muted-foreground">
                    Here's what's happening with your bookings today.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button
                    asChild
                    variant="outline"
                    data-test="dashboard-booking-page"
                >
                    <a
                        href={bookingPage.url(teamSlug)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ExternalLink /> Booking page
                    </a>
                </Button>
                <Button
                    onClick={onAddAppointment}
                    data-test="dashboard-add-appointment"
                >
                    <CalendarPlus /> Add appointment
                </Button>
            </div>
        </div>
    );
}
