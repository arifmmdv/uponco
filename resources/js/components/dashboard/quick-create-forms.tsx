import AppointmentFormDrawer from '@/components/appointments/appointment-form-drawer';
import type { SlotRequest } from '@/components/appointments/appointment-form-drawer';
import CustomerFormDialog from '@/components/customers/customer-form-dialog';
import LocationFormDrawer from '@/components/locations/location-form-drawer';
import ServiceFormDrawer from '@/components/services/service-form-drawer';
import type { AppointmentSlot, DashboardFormOptions } from '@/types';

export type QuickCreateForm =
    | 'appointment'
    | 'customer'
    | 'service'
    | 'location';

type Props = {
    open: QuickCreateForm | null;
    onOpenChange: (form: QuickCreateForm, open: boolean) => void;
    options: DashboardFormOptions;
    teamSlug: string;
    timezone: string;
    availableSlots: AppointmentSlot[];
    slotsLoading: boolean;
    onRequestSlots: (request: SlotRequest) => void;
};

/**
 * Hosts the four quick-create drawers/dialog reused from their feature areas.
 * Each renders in "create" mode (null record) and closes on success.
 */
export default function QuickCreateForms({
    open,
    onOpenChange,
    options,
    teamSlug,
    timezone,
    availableSlots,
    slotsLoading,
    onRequestSlots,
}: Props) {
    return (
        <>
            <AppointmentFormDrawer
                open={open === 'appointment'}
                onOpenChange={(next) => onOpenChange('appointment', next)}
                appointment={null}
                teamSlug={teamSlug}
                timezone={timezone}
                services={options.appointments.services}
                locations={options.appointments.locations}
                specialists={options.appointments.specialists}
                availableSlots={availableSlots}
                slotsLoading={slotsLoading}
                onRequestSlots={onRequestSlots}
            />

            <CustomerFormDialog
                open={open === 'customer'}
                onOpenChange={(next) => onOpenChange('customer', next)}
                customer={null}
                teamSlug={teamSlug}
            />

            <ServiceFormDrawer
                open={open === 'service'}
                onOpenChange={(next) => onOpenChange('service', next)}
                service={null}
                defaultCategoryId={null}
                teamSlug={teamSlug}
                categories={options.services.categories}
                locations={options.services.locations}
                specialists={options.services.specialists}
                priceTypes={options.services.priceTypes}
                serviceTypes={options.services.serviceTypes}
                deliveryTypes={options.services.deliveryTypes}
                meetingProviders={options.services.meetingProviders}
            />

            <LocationFormDrawer
                open={open === 'location'}
                onOpenChange={(next) => onOpenChange('location', next)}
                location={null}
                teamSlug={teamSlug}
                services={options.locations.services}
                specialists={options.locations.specialists}
                countries={options.locations.countries}
                timezones={options.locations.timezones}
            />
        </>
    );
}
