import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    formatAppointmentDay,
    formatAppointmentTimeRange,
} from '@/lib/appointments';
import type { Appointment } from '@/types';

type Props = {
    appointments: Appointment[];
    onEdit: (appointment: Appointment) => void;
    onDelete: (appointment: Appointment) => void;
};

export default function AppointmentsTable({
    appointments,
    onEdit,
    onDelete,
}: Props) {
    if (appointments.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-10 text-center">
                <p className="text-sm text-muted-foreground">
                    No appointments yet. Book your first appointment to get
                    started.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Day &amp; time</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {appointments.map((appointment) => (
                        <TableRow
                            key={appointment.id}
                            data-test="appointment-row"
                        >
                            <TableCell className="font-medium">
                                <div>
                                    {formatAppointmentDay(
                                        appointment.start_at,
                                        appointment.timezone,
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {formatAppointmentTimeRange(
                                        appointment.start_at,
                                        appointment.end_at,
                                        appointment.timezone,
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{appointment.service.title}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {appointment.location.name}
                            </TableCell>
                            <TableCell>{appointment.customer.name}</TableCell>
                            <TableCell className="text-right">
                                <TooltipProvider>
                                    <div className="flex items-center justify-end gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    data-test="appointment-edit-button"
                                                    onClick={() =>
                                                        onEdit(appointment)
                                                    }
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Edit appointment</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    data-test="appointment-delete-button"
                                                    onClick={() =>
                                                        onDelete(appointment)
                                                    }
                                                >
                                                    <Trash2 className="size-4 text-destructive" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Delete appointment</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TooltipProvider>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
