import type { DeliveryType } from './services';

export type AppointmentServiceOption = {
    id: number;
    title: string;
    duration: number;
    delivery_type: DeliveryType;
    category_id: number;
    category_name: string;
    location_ids: number[];
    specialist_ids: number[];
};

export type AppointmentLocationOption = {
    id: number;
    name: string;
    service_ids: number[];
    specialist_ids: number[];
};

export type AppointmentSpecialistOption = {
    id: number;
    name: string;
    service_ids: number[];
    location_ids: number[];
};

export type AppointmentSlot = {
    /** ISO-8601 UTC instant of the slot start. */
    start: string;
    /** ISO-8601 UTC instant of the slot end. */
    end: string;
    /** Wall-clock start time (HH:MM) in the team timezone. */
    label: string;
    available: boolean;
};

export type Appointment = {
    id: number;
    start_at: string;
    end_at: string;
    timezone: string;
    notes: string | null;
    service: { id: number; title: string };
    location: { id: number; name: string } | null;
    specialist: { id: number; name: string };
    customer: {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
    };
    service_id: number;
    location_id: number | null;
    specialist_id: number;
};
