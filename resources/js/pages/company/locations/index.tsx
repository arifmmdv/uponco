import { Head, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import Heading from '@/components/heading';
import DeleteLocationModal from '@/components/locations/delete-location-modal';
import LocationFormDrawer from '@/components/locations/location-form-drawer';
import LocationsTable from '@/components/locations/locations-table';
import { Button } from '@/components/ui/button';
import { index as companyIndex } from '@/routes/company';
import { index as locationsIndex } from '@/routes/company/locations';
import type { Location, SelectOption } from '@/types';

type Props = {
    locations: Location[];
    countries: SelectOption[];
    timezones: SelectOption[];
};

export default function LocationsIndex({
    locations,
    countries,
    timezones,
}: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Location | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState<Location | null>(null);

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (location: Location) => {
        setEditing(location);
        setFormOpen(true);
    };

    const confirmDelete = (location: Location) => {
        setDeleting(location);
        setDeleteOpen(true);
    };

    return (
        <>
            <Head title="Locations" />

            <div className="flex flex-col space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Locations"
                        description="Manage the physical locations for your company"
                    />

                    <Button
                        data-test="add-location-button"
                        onClick={openCreate}
                    >
                        <Plus /> Add location
                    </Button>
                </div>

                <LocationsTable
                    locations={locations}
                    countries={countries}
                    onEdit={openEdit}
                    onDelete={confirmDelete}
                />
            </div>

            <LocationFormDrawer
                open={formOpen}
                onOpenChange={setFormOpen}
                location={editing}
                teamSlug={teamSlug}
                countries={countries}
                timezones={timezones}
            />

            <DeleteLocationModal
                location={deleting}
                teamSlug={teamSlug}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </>
    );
}

LocationsIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Company',
            href: props.currentTeam
                ? companyIndex(props.currentTeam.slug)
                : '/',
        },
        {
            title: 'Locations',
            href: props.currentTeam
                ? locationsIndex(props.currentTeam.slug)
                : '/',
        },
    ],
});
