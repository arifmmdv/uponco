import { Form } from '@inertiajs/react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { PhoneInput } from '@/components/ui/phone-input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { store, update } from '@/routes/company/locations';
import type { Location, SelectOption } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    location: Location | null;
    teamSlug: string;
    services: SelectOption[];
    specialists: SelectOption[];
    countries: SelectOption[];
};

export default function LocationFormDrawer({
    open,
    onOpenChange,
    location,
    teamSlug,
    services,
    specialists,
    countries,
}: Props) {
    const isEditing = location !== null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
            >
                <SheetHeader className="shrink-0 border-b">
                    <SheetTitle>
                        {isEditing ? 'Edit location' : 'Add location'}
                    </SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? 'Update the details for this location.'
                            : 'Add a new location for your company.'}
                    </SheetDescription>
                </SheetHeader>

                <LocationFormFields
                    key={location?.id ?? 'new'}
                    location={location}
                    teamSlug={teamSlug}
                    services={services}
                    specialists={specialists}
                    countries={countries}
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </SheetContent>
        </Sheet>
    );
}

type FieldsProps = {
    location: Location | null;
    teamSlug: string;
    services: SelectOption[];
    specialists: SelectOption[];
    countries: SelectOption[];
    onSuccess: () => void;
    onCancel: () => void;
};

function LocationFormFields({
    location,
    teamSlug,
    services,
    specialists,
    countries,
    onSuccess,
    onCancel,
}: FieldsProps) {
    const isEditing = location !== null;

    const [isActive, setIsActive] = useState(location?.is_active ?? true);
    const [country, setCountry] = useState(location?.country ?? '');
    const [serviceIds, setServiceIds] = useState<string[]>(
        location?.service_ids.map((id) => id.toString()) ?? [],
    );
    const [specialistIds, setSpecialistIds] = useState<string[]>(
        location?.user_ids.map((id) => id.toString()) ?? [],
    );

    return (
        <Form
            {...(isEditing
                ? update.form([teamSlug, location.id])
                : store.form(teamSlug))}
            options={{ preserveScroll: true }}
            onSuccess={onSuccess}
            className="flex min-h-0 flex-1 flex-col"
            disableWhileProcessing
        >
            {({ errors, processing }) => (
                <>
                    <input
                        type="hidden"
                        name="is_active"
                        value={isActive ? '1' : '0'}
                    />
                    <input type="hidden" name="country" value={country} />
                    {serviceIds.map((id) => (
                        <input
                            key={`service-${id}`}
                            type="hidden"
                            name="service_ids[]"
                            value={id}
                        />
                    ))}
                    {specialistIds.map((id) => (
                        <input
                            key={`specialist-${id}`}
                            type="hidden"
                            name="user_ids[]"
                            value={id}
                        />
                    ))}

                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active">Active</Label>
                                <p className="text-sm text-muted-foreground">
                                    Inactive locations are hidden from use.
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                                data-test="location-active-switch"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                data-test="location-name-input"
                                defaultValue={location?.name ?? ''}
                                placeholder="Head office"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="country">Country / region</Label>
                            <SearchableSelect
                                id="country"
                                options={countries}
                                value={country}
                                onChange={setCountry}
                                placeholder="Select a country"
                                searchPlaceholder="Search countries…"
                                emptyMessage="No countries found."
                                invalid={Boolean(errors.country)}
                                data-test="location-country-select"
                            />
                            <InputError message={errors.country} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="city"
                                defaultValue={location?.city ?? ''}
                                placeholder="San Francisco"
                            />
                            <InputError message={errors.city} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="street_address">
                                Street address
                            </Label>
                            <Input
                                id="street_address"
                                name="street_address"
                                defaultValue={location?.street_address ?? ''}
                                placeholder="123 Market St"
                            />
                            <InputError message={errors.street_address} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="unit">
                                Suite / apartment / unit
                            </Label>
                            <Input
                                id="unit"
                                name="unit"
                                defaultValue={location?.unit ?? ''}
                                placeholder="Suite 400"
                            />
                            <InputError message={errors.unit} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="postal_code">Postal code</Label>
                            <Input
                                id="postal_code"
                                name="postal_code"
                                defaultValue={location?.postal_code ?? ''}
                                placeholder="94103"
                            />
                            <InputError message={errors.postal_code} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <PhoneInput
                                id="phone"
                                name="phone"
                                defaultValue={location?.phone ?? ''}
                                placeholder="+1 (555) 123-4567"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="service_ids">Services</Label>
                            <MultiSelect
                                id="service_ids"
                                options={services}
                                value={serviceIds}
                                onChange={setServiceIds}
                                placeholder="Select services"
                                searchPlaceholder="Search services…"
                                emptyMessage="No services found."
                                invalid={Boolean(errors.service_ids)}
                                data-test="location-services-select"
                            />
                            <p className="text-sm text-muted-foreground">
                                Services offered at this location.
                            </p>
                            <InputError message={errors.service_ids} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="user_ids">Specialists</Label>
                            <MultiSelect
                                id="user_ids"
                                options={specialists}
                                value={specialistIds}
                                onChange={setSpecialistIds}
                                placeholder="Select specialists"
                                searchPlaceholder="Search specialists…"
                                emptyMessage="No specialists found."
                                invalid={Boolean(errors.user_ids)}
                                data-test="location-specialists-select"
                            />
                            <p className="text-sm text-muted-foreground">
                                Team members who work at this location.
                            </p>
                            <InputError message={errors.user_ids} />
                        </div>
                    </div>

                    <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            data-test="location-save-button"
                            disabled={processing}
                        >
                            {isEditing ? 'Save changes' : 'Add location'}
                        </Button>
                    </SheetFooter>
                </>
            )}
        </Form>
    );
}
