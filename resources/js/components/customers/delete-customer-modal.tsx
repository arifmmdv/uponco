import { router } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { destroy } from '@/routes/customers';
import type { Customer } from '@/types';

type Props = {
    customer: Customer | null;
    teamSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteCustomerModal({
    customer,
    teamSlug,
    open,
    onOpenChange,
}: Props) {
    const [processing, setProcessing] = useState(false);

    const deleteCustomer = () => {
        if (!customer) {
            return;
        }

        router.visit(destroy([teamSlug, customer.id]), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete customer</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <strong>"{customer?.name}"</strong>? This action cannot
                        be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="delete-customer-confirm"
                        disabled={processing}
                        onClick={deleteCustomer}
                    >
                        Delete customer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
