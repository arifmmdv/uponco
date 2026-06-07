import { Head, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import CustomerFormDialog from '@/components/customers/customer-form-dialog';
import CustomersTable from '@/components/customers/customers-table';
import DeleteCustomerModal from '@/components/customers/delete-customer-modal';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { index as customersIndex } from '@/routes/customers';
import type { Customer } from '@/types';

type Props = {
    customers: Customer[];
};

export default function CustomersIndex({ customers }: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Customer | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState<Customer | null>(null);

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (customer: Customer) => {
        setEditing(customer);
        setFormOpen(true);
    };

    const confirmDelete = (customer: Customer) => {
        setDeleting(customer);
        setDeleteOpen(true);
    };

    return (
        <>
            <Head title="Customers" />

            <div className="flex flex-col space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Customers"
                        description="Manage the customers your company works with"
                    />

                    <Button
                        data-test="add-customer-button"
                        onClick={openCreate}
                    >
                        <Plus /> Add customer
                    </Button>
                </div>

                <CustomersTable
                    customers={customers}
                    onEdit={openEdit}
                    onDelete={confirmDelete}
                />
            </div>

            <CustomerFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                customer={editing}
                teamSlug={teamSlug}
            />

            <DeleteCustomerModal
                customer={deleting}
                teamSlug={teamSlug}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </>
    );
}

CustomersIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Customers',
            href: props.currentTeam
                ? customersIndex(props.currentTeam.slug)
                : '/',
        },
    ],
});
