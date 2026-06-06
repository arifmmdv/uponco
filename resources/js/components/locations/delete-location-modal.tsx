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
import { destroy } from '@/routes/company/locations';
import type { Location } from '@/types';

type Props = {
    location: Location | null;
    teamSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteLocationModal({
    location,
    teamSlug,
    open,
    onOpenChange,
}: Props) {
    const [processing, setProcessing] = useState(false);

    const deleteLocation = () => {
        if (!location) {
            return;
        }

        router.visit(destroy([teamSlug, location.id]), {
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
                    <DialogTitle>Delete location</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <strong>"{location?.name}"</strong>? This action cannot
                        be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="delete-location-confirm"
                        disabled={processing}
                        onClick={deleteLocation}
                    >
                        Delete location
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
