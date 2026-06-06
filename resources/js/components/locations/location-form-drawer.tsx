import { Form } from '@inertiajs/react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    countries: SelectOption[];
    timezones: SelectOption[];
};

export default function LocationFormDrawer({
    open,
    onOpenChange,
    location,
    teamSlug,
    countries,
    timezones,
}: Props) {
    const isEditing = location !== null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full overflow-y-auto sm:max-w-md"
            >
                <SheetHeader>
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
                    countries={countries}
                    timezones={timezones}
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
    countries: SelectOption[];
    timezones: SelectOption[];
    onSuccess: () => void;
    onCancel: () => void;
};

function LocationFormFields({
    location,
    teamSlug,
    countries,
    timezones,
    onSuccess,
    onCancel,
}: FieldsProps) {
    const isEditing = location !== null;

    const [isActive, setIsActive] = useState(location?.is_active ?? true);
    const [country, setCountry] = useState(location?.country ?? '');
    const [timezone, setTimezone] = useState(location?.timezone ?? '');

    return (
        <Form
            {...(isEditing
                ? update.form([teamSlug, location.id])
                : store.form(teamSlug))}
            options={{ preserveScroll: true }}
            onSuccess={onSuccess}
            className="flex flex-1 flex-col"
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
                    <input type="hidden" name="timezone" value={timezone} />

                    <div className="flex-1 space-y-5 px-4">
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
                            <Label htmlFor="unit">Suite / apartment / unit</Label>
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
                            <Label htmlFor="timezone">Timezone</Label>
                            <SearchableSelect
                                id="timezone"
                                options={timezones}
                                value={timezone}
                                onChange={setTimezone}
                                placeholder="Select a timezone"
                                searchPlaceholder="Search timezones…"
                                emptyMessage="No timezones found."
                                invalid={Boolean(errors.timezone)}
                                data-test="location-timezone-select"
                            />
                            <InputError message={errors.timezone} />
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
                    </div>

                    <SheetFooter className="flex-row justify-end gap-2">
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
