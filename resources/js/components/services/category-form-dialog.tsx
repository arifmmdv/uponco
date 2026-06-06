import { Form } from '@inertiajs/react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store, update } from '@/routes/company/service-categories';
import type { ServiceCategory } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: ServiceCategory | null;
    teamSlug: string;
};

export default function CategoryFormDialog({
    open,
    onOpenChange,
    category,
    teamSlug,
}: Props) {
    const isEditing = category !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit category' : 'Add category'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the name for this category.'
                            : 'Group your services under a new category.'}
                    </DialogDescription>
                </DialogHeader>

                <Form
                    key={category?.id ?? 'new'}
                    {...(isEditing
                        ? update.form([teamSlug, category.id])
                        : store.form(teamSlug))}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2 py-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    data-test="category-name-input"
                                    defaultValue={category?.name ?? ''}
                                    placeholder="Hair"
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    data-test="category-save-button"
                                    disabled={processing}
                                >
                                    {isEditing
                                        ? 'Save changes'
                                        : 'Add category'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
