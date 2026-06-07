import { router } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatAppointmentDay } from '@/lib/appointments';
import { destroy } from '@/routes/appointments';
import type { Appointment } from '@/types';

type Props = {
    appointment: Appointment | null;
    teamSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteAppointmentModal({
    appointment,
    teamSlug,
    open,
    onOpenChange,
}: Props) {
    const [processing, setProcessing] = useState(false);

    const deleteAppointment = () => {
        if (!appointment) {
            return;
        }

        router.visit(destroy([teamSlug, appointment.id]), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete appointment</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the appointment for{' '}
                        <strong>"{appointment?.customer.name}"</strong>
                        {appointment
                            ? ` on ${formatAppointmentDay(appointment.start_at, appointment.timezone)}`
                            : ''}
                        ? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="delete-appointment-confirm"
                        disabled={processing}
                        onClick={deleteAppointment}
                    >
                        Delete appointment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
