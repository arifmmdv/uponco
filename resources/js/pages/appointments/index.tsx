import { Head, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import AppointmentFormDrawer from '@/components/appointments/appointment-form-drawer';
import type { SlotRequest } from '@/components/appointments/appointment-form-drawer';
import AppointmentsTable from '@/components/appointments/appointments-table';
import DeleteAppointmentModal from '@/components/appointments/delete-appointment-modal';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { toDateInputValue } from '@/lib/appointments';
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
    services: AppointmentServiceOption[];
    locations: AppointmentLocationOption[];
    specialists: AppointmentSpecialistOption[];
    availableSlots?: AppointmentSlot[];
};

export default function AppointmentsIndex({
    appointments,
    services,
    locations,
    specialists,
    availableSlots = [],
}: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Appointment | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState<Appointment | null>(null);

    const requestSlots = (request: SlotRequest) => {
        router.reload({
            only: ['availableSlots'],
            data: {
                service_id: request.serviceId,
                location_id: request.locationId,
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

        const location = locations.find(
            (item) => item.id === appointment.location_id,
        );

        if (location) {
            requestSlots({
                serviceId: appointment.service_id,
                locationId: appointment.location_id,
                specialistId: appointment.specialist_id,
                date: toDateInputValue(appointment.start_at, location.timezone),
                appointmentId: appointment.id,
            });
        }
    };

    const confirmDelete = (appointment: Appointment) => {
        setDeleting(appointment);
        setDeleteOpen(true);
    };

    const hasBookableResources =
        services.length > 0 && locations.length > 0 && specialists.length > 0;

    return (
        <>
            <Head title="Appointments" />

            <div className="flex flex-col space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Appointments"
                        description="Manage the appointments booked with your company"
                    />

                    <Button
                        data-test="add-appointment-button"
                        disabled={!hasBookableResources}
                        onClick={openCreate}
                    >
                        <Plus /> New appointment
                    </Button>
                </div>

                <AppointmentsTable
                    appointments={appointments}
                    onEdit={openEdit}
                    onDelete={confirmDelete}
                />
            </div>

            <AppointmentFormDrawer
                open={formOpen}
                onOpenChange={setFormOpen}
                appointment={editing}
                teamSlug={teamSlug}
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
