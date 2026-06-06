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
import { destroy } from '@/routes/company/services';
import type { Service } from '@/types';

type Props = {
    service: Service | null;
    teamSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteServiceModal({
    service,
    teamSlug,
    open,
    onOpenChange,
}: Props) {
    const [processing, setProcessing] = useState(false);

    const deleteService = () => {
        if (!service) {
            return;
        }

        router.visit(destroy([teamSlug, service.id]), {
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
                    <DialogTitle>Delete service</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <strong>"{service?.title}"</strong>? This action cannot
                        be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="delete-service-confirm"
                        disabled={processing}
                        onClick={deleteService}
                    >
                        Delete service
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
