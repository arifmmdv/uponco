import { Head, router, usePage } from '@inertiajs/react';
import { CalendarRange, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import AppointmentFormDrawer from '@/components/appointments/appointment-form-drawer';
import type { SlotRequest } from '@/components/appointments/appointment-form-drawer';
import AppointmentsTable from '@/components/appointments/appointments-table';
import DeleteAppointmentModal from '@/components/appointments/delete-appointment-modal';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toDateInputValue } from '@/lib/appointments';
import { cn } from '@/lib/utils';
import { index as appointmentsIndex } from '@/routes/appointments';
import type {
    Appointment,
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSlot,
    AppointmentSpecialistOption,
} from '@/types';

type Props = {
    appointments: Appointment[];
    timezone: string;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationOption[];
    specialists: AppointmentSpecialistOption[];
    availableSlots?: AppointmentSlot[];
};

type Tab = 'upcoming' | 'past';
type View = 'minimal' | 'week' | 'month';

const VIEW_OPTIONS: { value: View; label: string }[] = [
    { value: 'minimal', label: 'Minimal' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
];

export default function AppointmentsIndex({
    appointments,
    timezone,
    services,
    locations,
    specialists,
    availableSlots = [],
}: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [tab, setTab] = useState<Tab>('upcoming');
    const [view, setView] = useState<View>('minimal');

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Appointment | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState<Appointment | null>(null);

    // Appointments arrive ordered ascending by start. Upcoming keeps that order
    // (closest future first); past is reversed so it reads closest-to-now first.
    const { upcoming, past } = useMemo(() => {
        const now = new Date().getTime();
        const upcoming: Appointment[] = [];
        const past: Appointment[] = [];

        for (const appointment of appointments) {
            if (new Date(appointment.start_at).getTime() >= now) {
                upcoming.push(appointment);
            } else {
                past.push(appointment);
            }
        }

        return { upcoming, past: past.reverse() };
    }, [appointments]);

    const activeAppointments = tab === 'upcoming' ? upcoming : past;

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

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (appointment: Appointment) => {
        setEditing(appointment);
        setFormOpen(true);

        requestSlots({
            serviceId: appointment.service_id,
            specialistId: appointment.specialist_id,
            date: toDateInputValue(appointment.start_at, timezone),
            appointmentId: appointment.id,
        });
    };

    const confirmDelete = (appointment: Appointment) => {
        setDeleting(appointment);
        setDeleteOpen(true);
    };

    const hasBookableResources = services.length > 0 && specialists.length > 0;

    return (
        <>
            <Head title="Appointments" />

            <div className="flex flex-col space-y-6 p-4">
                <div className="flex items-center justify-between gap-3">
                    <Heading
                        variant="small"
                        title="Appointments"
                        description="Manage the appointments booked with your company"
                    />

                    <div className="flex items-center gap-2">
                        <Select
                            value={view}
                            onValueChange={(value) => setView(value as View)}
                        >
                            <SelectTrigger
                                className="w-[120px]"
                                data-test="appointment-view-select"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {VIEW_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            data-test="add-appointment-button"
                            disabled={!hasBookableResources}
                            onClick={openCreate}
                        >
                            <Plus /> New appointment
                        </Button>
                    </div>
                </div>

                {view === 'minimal' ? (
                    <div className="space-y-4">
                        <div className="flex border-b">
                            <TabButton
                                active={tab === 'upcoming'}
                                onClick={() => setTab('upcoming')}
                                count={upcoming.length}
                                data-test="appointments-tab-upcoming"
                            >
                                Upcoming
                            </TabButton>
                            <TabButton
                                active={tab === 'past'}
                                onClick={() => setTab('past')}
                                count={past.length}
                                data-test="appointments-tab-past"
                            >
                                Past Appointments
                            </TabButton>
                        </div>

                        <AppointmentsTable
                            appointments={activeAppointments}
                            onEdit={openEdit}
                            onDelete={confirmDelete}
                            emptyMessage={
                                tab === 'upcoming'
                                    ? 'No upcoming appointments.'
                                    : 'No past appointments.'
                            }
                        />
                    </div>
                ) : (
                    <ComingSoonView view={view} />
                )}
            </div>

            <AppointmentFormDrawer
                open={formOpen}
                onOpenChange={setFormOpen}
                appointment={editing}
                teamSlug={teamSlug}
                timezone={timezone}
                services={services}
                locations={locations}
                specialists={specialists}
                availableSlots={availableSlots}
                slotsLoading={slotsLoading}
                onRequestSlots={requestSlots}
            />

            <DeleteAppointmentModal
                appointment={deleting}
                teamSlug={teamSlug}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </>
    );
}

type TabButtonProps = {
    active: boolean;
    onClick: () => void;
    count: number;
    children: React.ReactNode;
    'data-test'?: string;
};

function TabButton({
    active,
    onClick,
    count,
    children,
    ...props
}: TabButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                '-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
                'mr-6',
                active
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
            {...props}
        >
            {children}
            <span
                className={cn(
                    'rounded-full px-1.5 py-0.5 text-xs',
                    active
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground',
                )}
            >
                {count}
            </span>
        </button>
    );
}

function ComingSoonView({ view }: { view: View }) {
    return (
        <div className="flex flex-col items-center rounded-lg border border-dashed p-12 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <CalendarRange className="size-5" />
            </div>
            <p className="mt-4 text-sm font-medium capitalize">{view} view</p>
            <p className="mt-1 text-sm text-muted-foreground">
                This view is coming soon.
            </p>
        </div>
    );
}

AppointmentsIndex.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Appointments',
            href: props.currentTeam
                ? appointmentsIndex(props.currentTeam.slug)
                : '/',
        },
    ],
});
