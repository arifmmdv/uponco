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
import { destroy } from '@/routes/company/service-categories';
import type { ServiceCategory } from '@/types';

type Props = {
    category: ServiceCategory | null;
    serviceCount: number;
    teamSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteCategoryModal({
    category,
    serviceCount,
    teamSlug,
    open,
    onOpenChange,
}: Props) {
    const [processing, setProcessing] = useState(false);

    const deleteCategory = () => {
        if (!category) {
            return;
        }

        router.visit(destroy([teamSlug, category.id]), {
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
                    <DialogTitle>Delete category</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <strong>"{category?.name}"</strong>?{' '}
                        {serviceCount > 0
                            ? `This category has ${serviceCount} service(s) that will no longer be available.`
                            : 'This action cannot be undone.'}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="delete-category-confirm"
                        disabled={processing}
                        onClick={deleteCategory}
                    >
                        Delete category
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
