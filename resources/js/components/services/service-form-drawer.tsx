import { Form } from '@inertiajs/react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { store, update } from '@/routes/company/services';
import type {
    DeliveryType,
    PriceType,
    SelectOption,
    Service,
    ServiceCategory,
    ServiceTypeValue,
} from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: Service | null;
    defaultCategoryId: number | null;
    teamSlug: string;
    categories: ServiceCategory[];
    priceTypes: SelectOption[];
    serviceTypes: SelectOption[];
    deliveryTypes: SelectOption[];
    meetingProviders: SelectOption[];
};

export default function ServiceFormDrawer({
    open,
    onOpenChange,
    service,
    defaultCategoryId,
    teamSlug,
    categories,
    priceTypes,
    serviceTypes,
    deliveryTypes,
    meetingProviders,
}: Props) {
    const isEditing = service !== null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full overflow-y-auto sm:max-w-md"
            >
                <SheetHeader>
                    <SheetTitle>
                        {isEditing ? 'Edit service' : 'Add service'}
                    </SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? 'Update the details for this service.'
                            : 'Add a new service for your company.'}
                    </SheetDescription>
                </SheetHeader>

                <ServiceFormFields
                    key={service?.id ?? 'new'}
                    service={service}
                    defaultCategoryId={defaultCategoryId}
                    teamSlug={teamSlug}
                    categories={categories}
                    priceTypes={priceTypes}
                    serviceTypes={serviceTypes}
                    deliveryTypes={deliveryTypes}
                    meetingProviders={meetingProviders}
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </SheetContent>
        </Sheet>
    );
}

type FieldsProps = {
    service: Service | null;
    defaultCategoryId: number | null;
    teamSlug: string;
    categories: ServiceCategory[];
    priceTypes: SelectOption[];
    serviceTypes: SelectOption[];
    deliveryTypes: SelectOption[];
    meetingProviders: SelectOption[];
    onSuccess: () => void;
    onCancel: () => void;
};

function ServiceFormFields({
    service,
    defaultCategoryId,
    teamSlug,
    categories,
    priceTypes,
    serviceTypes,
    deliveryTypes,
    meetingProviders,
    onSuccess,
    onCancel,
}: FieldsProps) {
    const isEditing = service !== null;

    const [isActive, setIsActive] = useState(service?.is_active ?? true);
    const [categoryId, setCategoryId] = useState(
        service?.service_category_id?.toString() ??
            defaultCategoryId?.toString() ??
            '',
    );
    const [priceType, setPriceType] = useState<PriceType>(
        service?.price_type ?? 'fixed',
    );
    const [serviceType, setServiceType] = useState<ServiceTypeValue>(
        service?.service_type ?? 'individual',
    );
    const [deliveryType, setDeliveryType] = useState<DeliveryType>(
        service?.delivery_type ?? 'onsite',
    );
    const [meetingProvider, setMeetingProvider] = useState(
        service?.online_meeting_provider ?? '',
    );

    const categoryOptions: SelectOption[] = categories.map((category) => ({
        value: category.id.toString(),
        label: category.name,
    }));

    return (
        <Form
            {...(isEditing
                ? update.form([teamSlug, service.id])
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
                    <input
                        type="hidden"
                        name="service_category_id"
                        value={categoryId}
                    />
                    <input type="hidden" name="price_type" value={priceType} />
                    <input
                        type="hidden"
                        name="service_type"
                        value={serviceType}
                    />
                    <input
                        type="hidden"
                        name="delivery_type"
                        value={deliveryType}
                    />
                    {deliveryType === 'online' && (
                        <input
                            type="hidden"
                            name="online_meeting_provider"
                            value={meetingProvider}
                        />
                    )}

                    <div className="flex-1 space-y-5 px-4">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active">Active</Label>
                                <p className="text-sm text-muted-foreground">
                                    Inactive services are hidden from use.
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                                data-test="service-active-switch"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                data-test="service-title-input"
                                defaultValue={service?.title ?? ''}
                                placeholder="Haircut"
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="service_category_id">
                                Category
                            </Label>
                            <SearchableSelect
                                id="service_category_id"
                                options={categoryOptions}
                                value={categoryId}
                                onChange={setCategoryId}
                                placeholder="Select a category"
                                searchPlaceholder="Search categories…"
                                emptyMessage="No categories found."
                                invalid={Boolean(errors.service_category_id)}
                                data-test="service-category-select"
                            />
                            <InputError message={errors.service_category_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="price_type">Price type</Label>
                            <SearchableSelect
                                id="price_type"
                                options={priceTypes}
                                value={priceType}
                                onChange={(value) =>
                                    setPriceType(value as PriceType)
                                }
                                placeholder="Select a price type"
                                invalid={Boolean(errors.price_type)}
                                data-test="service-price-type-select"
                            />
                            <InputError message={errors.price_type} />
                        </div>

                        {priceType === 'fixed' && (
                            <div className="grid gap-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    defaultValue={service?.price ?? ''}
                                    placeholder="50.00"
                                />
                                <InputError message={errors.price} />
                            </div>
                        )}

                        {priceType === 'range' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="price_min">Min price</Label>
                                    <Input
                                        id="price_min"
                                        name="price_min"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        defaultValue={service?.price_min ?? ''}
                                        placeholder="50.00"
                                    />
                                    <InputError message={errors.price_min} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price_max">Max price</Label>
                                    <Input
                                        id="price_max"
                                        name="price_max"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        defaultValue={service?.price_max ?? ''}
                                        placeholder="200.00"
                                    />
                                    <InputError message={errors.price_max} />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Duration (min)</Label>
                                <Input
                                    id="duration"
                                    name="duration"
                                    type="number"
                                    min="1"
                                    defaultValue={service?.duration ?? ''}
                                    placeholder="60"
                                />
                                <InputError message={errors.duration} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="technical_break">
                                    Break (min)
                                </Label>
                                <Input
                                    id="technical_break"
                                    name="technical_break"
                                    type="number"
                                    min="0"
                                    defaultValue={service?.technical_break ?? 0}
                                    placeholder="0"
                                />
                                <InputError message={errors.technical_break} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="service_type">Service type</Label>
                            <SearchableSelect
                                id="service_type"
                                options={serviceTypes}
                                value={serviceType}
                                onChange={(value) =>
                                    setServiceType(value as ServiceTypeValue)
                                }
                                placeholder="Select a service type"
                                invalid={Boolean(errors.service_type)}
                                data-test="service-type-select"
                            />
                            <InputError message={errors.service_type} />
                        </div>

                        {serviceType === 'group' && (
                            <div className="grid gap-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input
                                    id="capacity"
                                    name="capacity"
                                    type="number"
                                    min="1"
                                    defaultValue={service?.capacity ?? ''}
                                    placeholder="10"
                                />
                                <InputError message={errors.capacity} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="delivery_type">Delivery type</Label>
                            <SearchableSelect
                                id="delivery_type"
                                options={deliveryTypes}
                                value={deliveryType}
                                onChange={(value) =>
                                    setDeliveryType(value as DeliveryType)
                                }
                                placeholder="Select a delivery type"
                                invalid={Boolean(errors.delivery_type)}
                                data-test="service-delivery-type-select"
                            />
                            <InputError message={errors.delivery_type} />
                        </div>

                        {deliveryType === 'online' && (
                            <div className="grid gap-2">
                                <Label htmlFor="online_meeting_provider">
                                    Online meeting provider
                                </Label>
                                <SearchableSelect
                                    id="online_meeting_provider"
                                    options={meetingProviders}
                                    value={meetingProvider}
                                    onChange={setMeetingProvider}
                                    placeholder="Select a provider"
                                    invalid={Boolean(
                                        errors.online_meeting_provider,
                                    )}
                                    data-test="service-meeting-provider-select"
                                />
                                <InputError
                                    message={errors.online_meeting_provider}
                                />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={service?.description ?? ''}
                                placeholder="Describe this service…"
                                rows={4}
                            />
                            <InputError message={errors.description} />
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
                            data-test="service-save-button"
                            disabled={processing}
                        >
                            {isEditing ? 'Save changes' : 'Add service'}
                        </Button>
                    </SheetFooter>
                </>
            )}
        </Form>
    );
}
