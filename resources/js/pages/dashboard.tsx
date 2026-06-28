import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import type { SlotRequest } from '@/components/appointments/appointment-form-drawer';
import BookingsChart from '@/components/dashboard/bookings-chart';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import DashboardStats from '@/components/dashboard/dashboard-stats';
import QuickActions from '@/components/dashboard/quick-actions';
import QuickCreateForms from '@/components/dashboard/quick-create-forms';
import type { QuickCreateForm } from '@/components/dashboard/quick-create-forms';
import UpcomingAppointments from '@/components/dashboard/upcoming-appointments';
import OnboardingWizard from '@/components/onboarding/onboarding-wizard';
import { dashboard } from '@/routes';
import type {
    AppointmentSlot,
    DashboardFormOptions,
    DashboardStats as Stats,
    DashboardTrendDay,
    Onboarding,
    UpcomingAppointment,
} from '@/types';

type Props = {
    onboarding: Onboarding | null;
    timezone: string;
    stats: Stats | null;
    weeklyTrend: DashboardTrendDay[] | null;
    upcomingAppointments: UpcomingAppointment[] | null;
    formOptions: DashboardFormOptions | null;
    availableSlots?: AppointmentSlot[];
};

const EMPTY_STATS: Stats = {
    customers: 0,
    totalBookings: 0,
    upcoming: 0,
    services: 0,
    locations: 0,
};

export default function Dashboard({
    onboarding,
    timezone,
    stats,
    weeklyTrend,
    upcomingAppointments,
    formOptions,
    availableSlots = [],
}: Props) {
    const { auth, currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';
    const firstName = auth.user.name.split(' ')[0];

    const [openForm, setOpenForm] = useState<QuickCreateForm | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));

        return () => cancelAnimationFrame(frame);
    }, []);

    const requestSlots = (request: SlotRequest) => {
        router.reload({
            only: ['availableSlots'],
            data: {
                service_id: request.serviceId,
                specialist_id: request.specialistId,
                date: request.date,
                appointment_id: request.appointmentId ?? '',
            },
            onStart: () => setSlotsLoading(true),
            onFinish: () => setSlotsLoading(false),
        });
    };

    if (onboarding) {
        return (
            <>
                <Head title="Dashboard" />
                <OnboardingWizard onboarding={onboarding} />
            </>
        );
    }

    const safeStats = stats ?? EMPTY_STATS;
    const trend = weeklyTrend ?? [];
    const upcoming = upcomingAppointments ?? [];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <DashboardHeader
                    firstName={firstName}
                    teamSlug={teamSlug}
                    onAddAppointment={() => setOpenForm('appointment')}
                />

                <DashboardStats
                    stats={safeStats}
                    teamSlug={teamSlug}
                    mounted={mounted}
                />

                {/*
                    Main column (chart + upcoming list) sits beside a right rail
                    of quick actions on desktop. On mobile everything stacks; the
                    quick actions are pulled up first so the shortcuts stay close
                    to the top of the screen.
                */}
                <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-start">
                    <div className="order-1 flex flex-col gap-6 lg:order-none lg:col-span-2">
                        {trend.length > 0 && (
                            <BookingsChart trend={trend} mounted={mounted} />
                        )}

                        <UpcomingAppointments
                            appointments={upcoming}
                            teamSlug={teamSlug}
                            onAddAppointment={() => setOpenForm('appointment')}
                        />
                    </div>

                    <div className="order-first lg:order-none lg:col-span-1">
                        <QuickActions
                            onAddAppointment={() => setOpenForm('appointment')}
                            onAddCustomer={() => setOpenForm('customer')}
                            onAddService={() => setOpenForm('service')}
                            onAddLocation={() => setOpenForm('location')}
                        />
                    </div>
                </div>
            </div>

            {formOptions && (
                <QuickCreateForms
                    open={openForm}
                    onOpenChange={(form, open) =>
                        setOpenForm(open ? form : null)
                    }
                    options={formOptions}
                    teamSlug={teamSlug}
                    timezone={timezone}
                    availableSlots={availableSlots}
                    slotsLoading={slotsLoading}
                    onRequestSlots={requestSlots}
                />
            )}
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});
