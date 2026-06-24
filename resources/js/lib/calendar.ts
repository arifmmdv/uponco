export type CalendarEvent = {
    /** Event title, e.g. "Haircut · Acme Salon". */
    title: string;
    /** ISO-8601 instant of the start. */
    start: string;
    /** ISO-8601 instant of the end. */
    end: string;
    location?: string;
    description?: string;
};

/**
 * Format an ISO instant as the UTC basic format used by iCalendar and the
 * Google Calendar template URL, e.g. `20260625T090000Z`.
 */
function toUtcStamp(iso: string): string {
    return new Date(iso)
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
}

/**
 * Escape a value for use inside an iCalendar text property per RFC 5545.
 */
function escapeIcsText(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n');
}

/**
 * Build a Google Calendar "add event" link that opens a pre-filled event.
 */
export function buildGoogleCalendarUrl(event: CalendarEvent): string {
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${toUtcStamp(event.start)}/${toUtcStamp(event.end)}`,
    });

    if (event.description) {
        params.set('details', event.description);
    }

    if (event.location) {
        params.set('location', event.location);
    }

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Render the event as an iCalendar (.ics) document.
 */
export function buildIcsContent(event: CalendarEvent): string {
    const uid = `${toUtcStamp(event.start)}-${Math.random().toString(36).slice(2)}@uponco`;

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Uponco//Appointments//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${toUtcStamp(new Date().toISOString())}`,
        `DTSTART:${toUtcStamp(event.start)}`,
        `DTEND:${toUtcStamp(event.end)}`,
        `SUMMARY:${escapeIcsText(event.title)}`,
        event.description
            ? `DESCRIPTION:${escapeIcsText(event.description)}`
            : null,
        event.location ? `LOCATION:${escapeIcsText(event.location)}` : null,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR',
    ].filter((line): line is string => line !== null);

    return `${lines.join('\r\n')}\r\n`;
}

/**
 * Trigger a download of the event as an .ics file. On iOS/macOS this opens
 * Apple Calendar's "Add Event" sheet; on desktop it saves the file, which most
 * calendar apps register as their default handler.
 */
export function downloadIcsFile(event: CalendarEvent): void {
    const blob = new Blob([buildIcsContent(event)], {
        type: 'text/calendar;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'appointment.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
