import { Link } from '@inertiajs/react';
import { CalendarClock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dayLabel, formatAppointmentTimeRange } from '@/lib/appointments';
import { index as appointmentsIndex } from '@/routes/appointments';
import type { UpcomingAppointment } from '@/types';

type Props = {
    appointments: UpcomingAppointment[];
    teamSlug: string;
    onAddAppointment: () => void;
};

export default function UpcomingAppointments({
    appointments,
    teamSlug,
    onAddAppointment,
}: Props) {
    return (
        <Card>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium">
                        Upcoming appointments
                    </h3>
                    {appointments.length > 0 && (
                        <Link
                            href={appointmentsIndex.url(teamSlug)}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            View all
                        </Link>
                    )}
                </div>

                {appointments.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <CalendarClock className="mx-auto mb-2 size-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            No upcoming appointments yet.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={onAddAppointment}
                        >
                            Book an appointment
                        </Button>
                    </div>
                ) : (
                    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {appointments.map((appointment) => (
                            <li
                                key={appointment.id}
                                className="flex items-start justify-between gap-3 rounded-lg border p-3"
                            >
                                <div className="min-w-0 space-y-0.5">
                                    <p className="truncate text-sm font-medium">
                                        {appointment.service.title}
                                    </p>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {appointment.customer.name}
                                        {appointment.location
                                            ? ` · ${appointment.location.name}`
                                            : ''}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-xs font-medium">
                                        {dayLabel(
                                            appointment.start_at,
                                            appointment.timezone,
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatAppointmentTimeRange(
                                            appointment.start_at,
                                            appointment.end_at,
                                            appointment.timezone,
                                        )}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
