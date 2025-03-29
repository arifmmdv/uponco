import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { TeamMember, useStaff } from "./StaffContext";
import { useState } from "react";
import { router } from "@inertiajs/react";

interface DeleteMemberConfirmationProps {
    teamMember: TeamMember | null;
    isOpen: boolean;
    onClose: () => void;
}

export function DeleteMemberConfirmation({ teamMember, isOpen, onClose }: DeleteMemberConfirmationProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    
    const handleDelete = () => {
        if (!teamMember) return;
        
        setIsDeleting(true);
        router.post(route('company.deleteUser', teamMember.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };
    
    if (!teamMember) return null;
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Team Member</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <span className="font-medium">{teamMember.name}</span>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" disabled={isDeleting}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 