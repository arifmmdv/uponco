import type {
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from '@/types';

export type AppointmentSelection = {
    serviceId: number | null;
    locationId: number | null;
    specialistId: number | null;
};

export type ServiceCategoryGroup = {
    id: number;
    name: string;
    services: AppointmentServiceOption[];
};

/**
 * Narrow each of the three option lists based on the current selection.
 *
 * Service, location and specialist all relate to one another, so picking any
 * of them constrains the choices available for the other two. This is the core
 * availability logic shared between the dashboard and the public booking page.
 */
export function getAvailableOptions(
    services: AppointmentServiceOption[],
    locations: AppointmentLocationOption[],
    specialists: AppointmentSpecialistOption[],
    selection: AppointmentSelection,
) {
    const { serviceId, locationId, specialistId } = selection;

    const availableServices = services.filter(
        (service) =>
            (locationId === null ||
                service.location_ids.includes(locationId)) &&
            (specialistId === null ||
                service.specialist_ids.includes(specialistId)),
    );

    const availableLocations = locations.filter(
        (location) =>
            (serviceId === null || location.service_ids.includes(serviceId)) &&
            (specialistId === null ||
                location.specialist_ids.includes(specialistId)),
    );

    const availableSpecialists = specialists.filter(
        (specialist) =>
            (serviceId === null ||
                specialist.service_ids.includes(serviceId)) &&
            (locationId === null ||
                specialist.location_ids.includes(locationId)),
    );

    return { availableServices, availableLocations, availableSpecialists };
}

/**
 * Group services by their category for a grouped select control.
 */
export function groupServicesByCategory(
    services: AppointmentServiceOption[],
): ServiceCategoryGroup[] {
    const groups = new Map<number, ServiceCategoryGroup>();

    for (const service of services) {
        const group = groups.get(service.category_id);

        if (group) {
            group.services.push(service);
        } else {
            groups.set(service.category_id, {
                id: service.category_id,
                name: service.category_name,
                services: [service],
            });
        }
    }

    return Array.from(groups.values());
}

/**
 * Format the day portion of an appointment in the location timezone.
 */
export function formatAppointmentDay(iso: string, timezone: string): string {
    return new Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(iso));
}

/**
 * Convert an ISO instant to a `YYYY-MM-DD` value (in the location timezone)
 * suitable for a native date input.
 */
export function toDateInputValue(iso: string, timezone: string): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(iso));
}

/**
 * Get today's date as a `YYYY-MM-DD` value, used as the minimum bookable day.
 */
export function todayDateInputValue(): string {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Format the start–end time range of an appointment in the location timezone.
 */
export function formatAppointmentTimeRange(
    startIso: string,
    endIso: string,
    timezone: string,
): string {
    const formatter = new Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${formatter.format(new Date(startIso))} – ${formatter.format(new Date(endIso))}`;
}
