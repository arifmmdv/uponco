import { Head, router } from '@inertiajs/react';
import { ArrowLeft, MapPin, Scissors, User } from 'lucide-react';
import { useMemo, useState } from 'react';

import ExpandableCard from '@/components/public-booking/expandable-card';
import LocationPicker from '@/components/public-booking/location-picker';
import ServicePicker from '@/components/public-booking/service-picker';
import SpecialistPicker from '@/components/public-booking/specialist-picker';
import StepDateTime from '@/components/public-booking/step-datetime';
import StepDetails from '@/components/public-booking/step-details';
import type { CustomerDetails } from '@/components/public-booking/step-details';
import SuccessScreen from '@/components/public-booking/success-screen';
import SummaryBar from '@/components/public-booking/summary-bar';
import { Button } from '@/components/ui/button';
import {
    buildUpcomingDays,
    formatAppointmentDay,
    formatAppointmentTimeRange,
    formatDuration,
    formatServicePrice,
    getAvailableOptions,
    groupServicesByCategory,
} from '@/lib/appointments';
import { store } from '@/routes/public/appointments';
import type {
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSlot,
    AppointmentSpecialistOption,
} from '@/types';

type Props = {
    company: { name: string; slug: string };
    timezone: string;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationOption[];
    specialists: AppointmentSpecialistOption[];
    availableSlots?: AppointmentSlot[];
};

type EntryCard = 'service' | 'location' | 'specialist' | null;

type ConfirmedSummary = {
    serviceTitle?: string;
    metaLabel?: string;
    specialistName?: string;
    locationName?: string | null;
    dateTimeLabel?: string;
    customerName: string;
};

const STEP_TITLES = [
    'What would you like to book?',
    'Pick a date & time',
    'Almost done',
];

export default function PublicAppointmentBooking({
    company,
    timezone,
    services,
    locations,
    specialists,
    availableSlots = [],
}: Props) {
    const upcomingDays = useMemo(() => buildUpcomingDays(14), []);

    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');
    const [openCard, setOpenCard] = useState<EntryCard>(null);

    const [serviceId, setServiceId] = useState<number | null>(null);
    const [locationId, setLocationId] = useState<number | null>(null);
    const [specialistId, setSpecialistId] = useState<number | null>(null);
    const [date, setDate] = useState('');
    const [selectedStart, setSelectedStart] = useState('');
    const [selectedEnd, setSelectedEnd] = useState('');
    const [slotsLoading, setSlotsLoading] = useState(false);

    const [details, setDetails] = useState<CustomerDetails>({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        notes: '',
    });
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [processing, setProcessing] = useState(false);
    const [confirmed, setConfirmed] = useState<ConfirmedSummary | null>(null);

    const { availableServices, availableLocations, availableSpecialists } =
        useMemo(
            () =>
                getAvailableOptions(services, locations, specialists, {
                    serviceId,
                    locationId,
                    specialistId,
                }),
            [
                services,
                locations,
                specialists,
                serviceId,
                locationId,
                specialistId,
            ],
        );

    const serviceGroups = useMemo(
        () => groupServicesByCategory(availableServices),
        [availableServices],
    );

    const selectedService = useMemo(
        () => services.find((item) => item.id === serviceId) ?? null,
        [services, serviceId],
    );
    const selectedLocation = useMemo(
        () => locations.find((item) => item.id === locationId) ?? null,
        [locations, locationId],
    );
    const selectedSpecialist = useMemo(
        () => specialists.find((item) => item.id === specialistId) ?? null,
        [specialists, specialistId],
    );

    const requiresLocation =
        selectedService !== null && selectedService.delivery_type !== 'online';
    const selectionComplete =
        serviceId !== null &&
        specialistId !== null &&
        (!requiresLocation || locationId !== null);

    const requestSlots = (next: {
        serviceId: number | null;
        specialistId: number | null;
        date: string;
    }) => {
        setSelectedStart('');
        setSelectedEnd('');

        if (
            next.serviceId === null ||
            next.specialistId === null ||
            next.date === ''
        ) {
            return;
        }

        router.reload({
            only: ['availableSlots'],
            data: {
                service_id: next.serviceId,
                specialist_id: next.specialistId,
                date: next.date,
                appointment_id: '',
            },
            onStart: () => setSlotsLoading(true),
            onFinish: () => setSlotsLoading(false),
        });
    };

    // After a selection, open the next still-missing entry card (or collapse).
    const focusNext = (next: {
        serviceId: number | null;
        locationId: number | null;
        specialistId: number | null;
    }) => {
        if (next.serviceId === null) {
            return setOpenCard('service');
        }

        if (next.specialistId === null) {
            return setOpenCard('specialist');
        }

        const service = services.find((item) => item.id === next.serviceId);
        const needsLocation =
            service != null && service.delivery_type !== 'online';

        if (needsLocation && next.locationId === null) {
            return setOpenCard('location');
        }

        return setOpenCard(null);
    };

    const handleServiceChange = (value: number) => {
        const service = services.find((item) => item.id === value);
        let nextLocationId = locationId;
        let nextSpecialistId = specialistId;

        if (service) {
            if (
                nextLocationId !== null &&
                !service.location_ids.includes(nextLocationId)
            ) {
                nextLocationId = null;
            }

            if (
                nextSpecialistId !== null &&
                !service.specialist_ids.includes(nextSpecialistId)
            ) {
                nextSpecialistId = null;
            }
        }

        setServiceId(value);
        setLocationId(nextLocationId);
        setSpecialistId(nextSpecialistId);
        focusNext({
            serviceId: value,
            locationId: nextLocationId,
            specialistId: nextSpecialistId,
        });
    };

    const handleLocationChange = (value: number) => {
        const location = locations.find((item) => item.id === value);
        let nextServiceId = serviceId;
        let nextSpecialistId = specialistId;

        if (location) {
            if (
                nextServiceId !== null &&
                !location.service_ids.includes(nextServiceId)
            ) {
                nextServiceId = null;
            }

            if (
                nextSpecialistId !== null &&
                !location.specialist_ids.includes(nextSpecialistId)
            ) {
                nextSpecialistId = null;
            }
        }

        setLocationId(value);
        setServiceId(nextServiceId);
        setSpecialistId(nextSpecialistId);
        focusNext({
            serviceId: nextServiceId,
            locationId: value,
            specialistId: nextSpecialistId,
        });
    };

    const handleSpecialistChange = (value: number) => {
        const specialist = specialists.find((item) => item.id === value);
        let nextServiceId = serviceId;
        let nextLocationId = locationId;

        if (specialist) {
            if (
                nextServiceId !== null &&
                !specialist.service_ids.includes(nextServiceId)
            ) {
                nextServiceId = null;
            }

            if (
                nextLocationId !== null &&
                !specialist.location_ids.includes(nextLocationId)
            ) {
                nextLocationId = null;
            }
        }

        setSpecialistId(value);
        setServiceId(nextServiceId);
        setLocationId(nextLocationId);
        focusNext({
            serviceId: nextServiceId,
            locationId: nextLocationId,
            specialistId: value,
        });
    };

    const handleDateChange = (value: string) => {
        setDate(value);
        requestSlots({ serviceId, specialistId, date: value });
    };

    const handleSelectSlot = (start: string) => {
        const slot = availableSlots.find((item) => item.start === start);
        setSelectedStart(start);
        setSelectedEnd(slot?.end ?? '');
    };

    const handleDetailChange = (
        field: keyof CustomerDetails,
        value: string,
    ) => {
        setDetails((current) => ({ ...current, [field]: value }));
        setErrors((current) => {
            const next = { ...current };
            delete next[field];

            return next;
        });
    };

    const toggleCard = (card: Exclude<EntryCard, null>) => {
        setOpenCard((current) => (current === card ? null : card));
    };

    const dateTimeLabel = selectedStart
        ? `${formatAppointmentDay(selectedStart, timezone)} · ${
              selectedEnd
                  ? formatAppointmentTimeRange(
                        selectedStart,
                        selectedEnd,
                        timezone,
                    )
                  : ''
          }`.trim()
        : undefined;

    const metaLabel = selectedService
        ? [
              formatDuration(selectedService.duration),
              formatServicePrice(selectedService),
          ]
              .filter(Boolean)
              .join(' · ')
        : undefined;

    const summary = {
        serviceTitle: selectedService?.title,
        metaLabel,
        specialistName: selectedSpecialist?.name,
        locationName: requiresLocation ? selectedLocation?.name : null,
        dateTimeLabel,
    };

    const goToStep = (next: number) => {
        setDirection(next > step ? 'forward' : 'back');
        setStep(next);
    };

    const handleContinue = () => {
        if (step === 0) {
            // Default the day to the specialist's nearest availability.
            if (date === '' && selectedSpecialist?.next_available) {
                handleDateChange(selectedSpecialist.next_available.date);
            }

            goToStep(1);

            return;
        }

        goToStep(2);
    };

    const handleSubmit = () => {
        router.post(
            store.url(company.slug),
            {
                service_id: serviceId,
                location_id: locationId,
                specialist_id: specialistId,
                start_at: selectedStart,
                ...details,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setProcessing(true),
                onError: (formErrors) => {
                    setErrors(formErrors);

                    if (
                        formErrors.service_id ||
                        formErrors.specialist_id ||
                        formErrors.location_id
                    ) {
                        goToStep(0);
                    } else if (formErrors.start_at) {
                        goToStep(1);
                    }
                },
                onSuccess: () => {
                    setConfirmed({
                        ...summary,
                        customerName: details.customer_name,
                    });
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const resetFlow = () => {
        setConfirmed(null);
        setServiceId(null);
        setLocationId(null);
        setSpecialistId(null);
        setDate('');
        setSelectedStart('');
        setSelectedEnd('');
        setDetails({
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            notes: '',
        });
        setErrors({});
        setOpenCard(null);
        setDirection('back');
        setStep(0);
    };

    const stepClass =
        direction === 'forward'
            ? 'animate-in fade-in-0 slide-in-from-right-8 duration-300'
            : 'animate-in fade-in-0 slide-in-from-left-8 duration-300';

    return (
        <div className="flex min-h-svh w-full justify-center bg-muted/30">
            <Head title={`Book an appointment · ${company.name}`} />

            <div className="flex w-full max-w-[460px] flex-col">
                <header className="space-y-4 px-5 pt-6 pb-4">
                    <div className="text-center">
                        <h1 className="text-lg font-semibold">
                            {company.name}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Book an appointment
                        </p>
                    </div>

                    {confirmed === null && <SummaryBar {...summary} />}
                </header>

                <main className="flex-1 px-5 pb-28">
                    {confirmed !== null ? (
                        <SuccessScreen
                            companyName={company.name}
                            customerName={confirmed.customerName}
                            summary={confirmed}
                            onBookAnother={resetFlow}
                        />
                    ) : (
                        <div key={step} className={stepClass}>
                            <h2 className="mb-5 text-base font-semibold">
                                {STEP_TITLES[step]}
                            </h2>

                            {step === 0 && (
                                <div className="space-y-3">
                                    <ExpandableCard
                                        icon={Scissors}
                                        title="Service"
                                        hint="Choose a treatment"
                                        selectedLabel={selectedService?.title}
                                        open={openCard === 'service'}
                                        onToggle={() => toggleCard('service')}
                                    >
                                        <ServicePicker
                                            groups={serviceGroups}
                                            selectedId={serviceId}
                                            onSelect={handleServiceChange}
                                        />
                                    </ExpandableCard>

                                    <ExpandableCard
                                        icon={User}
                                        title="Specialist"
                                        hint="Choose who you'll see"
                                        selectedLabel={selectedSpecialist?.name}
                                        open={openCard === 'specialist'}
                                        onToggle={() =>
                                            toggleCard('specialist')
                                        }
                                    >
                                        <SpecialistPicker
                                            specialists={availableSpecialists}
                                            selectedId={specialistId}
                                            onSelect={handleSpecialistChange}
                                        />
                                    </ExpandableCard>

                                    <ExpandableCard
                                        icon={MapPin}
                                        title="Location"
                                        hint="Pick where to visit"
                                        selectedLabel={selectedLocation?.name}
                                        open={openCard === 'location'}
                                        onToggle={() => toggleCard('location')}
                                    >
                                        <LocationPicker
                                            locations={availableLocations}
                                            selectedId={locationId}
                                            onSelect={handleLocationChange}
                                        />
                                    </ExpandableCard>
                                </div>
                            )}

                            {step === 1 && (
                                <StepDateTime
                                    days={upcomingDays}
                                    date={date}
                                    onDateChange={handleDateChange}
                                    timezone={timezone}
                                    slots={availableSlots}
                                    loading={slotsLoading}
                                    selectedStart={selectedStart}
                                    onSelectSlot={handleSelectSlot}
                                    error={errors.start_at}
                                />
                            )}

                            {step === 2 && (
                                <StepDetails
                                    values={details}
                                    onChange={handleDetailChange}
                                    errors={errors}
                                />
                            )}
                        </div>
                    )}
                </main>

                {confirmed === null && (
                    <footer className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[460px] items-center gap-3 border-t bg-background/95 px-5 py-3.5 backdrop-blur">
                        {step > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-[50px] shrink-0"
                                onClick={() => goToStep(step - 1)}
                                aria-label="Back"
                            >
                                <ArrowLeft className="size-5" />
                            </Button>
                        )}

                        {step < 2 ? (
                            <Button
                                type="button"
                                className="h-[50px] flex-1 text-base"
                                disabled={
                                    step === 0
                                        ? !selectionComplete
                                        : selectedStart === ''
                                }
                                onClick={handleContinue}
                            >
                                Continue
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                className="h-[50px] flex-1 text-base"
                                disabled={processing}
                                onClick={handleSubmit}
                                data-test="appointment-save-button"
                            >
                                Confirm booking
                            </Button>
                        )}
                    </footer>
                )}
            </div>
        </div>
    );
}
