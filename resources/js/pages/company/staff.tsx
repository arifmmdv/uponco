import {Head, useForm} from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import CompanyLayout from "@/layouts/company/layout";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import InputError from "@/components/input-error";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {FormEventHandler, useState} from "react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/company/staff',
    },
];

interface TeamMemberForm {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    role: string;
    id?: string;
}

interface TeamMember {
    name: string;
    email: string;
    role: string;
    id: string;
}

export default function Staff({ teamMembers }: { teamMembers: TeamMember[] }) {
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<Required<TeamMemberForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'staff',
        id: '',
    });

    const closeModal = () => {
        setOpen(false);
        clearErrors();
        reset();
        setIsEditing(false);
        setCurrentUserId(null);
    };

    const openAddUserModal = () => {
        setIsEditing(false);
        setData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'staff',
            id: '',
        });
        setOpen(true);
    };

    const openEditUserModal = (teamMember: TeamMember) => {
        setIsEditing(true);
        setCurrentUserId(teamMember.id);
        setData({
            name: teamMember.name,
            email: teamMember.email,
            role: teamMember.role || 'staff',
            password: '',
            password_confirmation: '',
            id: teamMember.id,
        });
        setOpen(true);
    };

    const submitForm: FormEventHandler = (e) => {
        e.preventDefault();
        setSaveSuccess(false);

        if (isEditing && currentUserId) {
            // Use post method for updating user with ID parameter
            post(route('company.updateUser', currentUserId), {
                preserveScroll: true,
                onSuccess: () => {
                    setSaveSuccess(true);
                    setTimeout(() => {
                        closeModal();
                        setSaveSuccess(false);
                    }, 1500);
                },
                onError: () => {
                    console.error('Error updating user:', errors);
                },
            });
        } else {
            // Existing add user logic
            post(route('company.addUser'), {
                preserveScroll: true,
                onSuccess: () => {
                    setSaveSuccess(true);
                    setTimeout(() => {
                        closeModal();
                        setSaveSuccess(false);
                    }, 1500);
                },
                onError: () => {
                    console.error('Error adding user:', errors);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Company staff" />

            <CompanyLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Company staff" description="Add or update your staff" />

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default" onClick={openAddUserModal}>Add User</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
                            <DialogDescription>
                                {isEditing
                                    ? 'Update the details of an existing user'
                                    : 'Add a new user to your company'}
                            </DialogDescription>
                            <form className="space-y-6" onSubmit={submitForm}>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        Name Surname
                                    </Label>

                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="John Doe"
                                        autoComplete="name"
                                    />

                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Email
                                    </Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="john.doe@example.com"
                                        autoComplete="email"
                                    />

                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={data.role || 'staff'}
                                        onValueChange={(value) => setData('role', value)}
                                        defaultValue="staff"
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="staff">Staff</SelectItem>
                                            <SelectItem value="company-owner">Company Owner</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role} />
                                </div>

                                {!isEditing && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">
                                                Password
                                            </Label>

                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Password"
                                                autoComplete="current-password"
                                            />

                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation">Confirm password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                disabled={processing}
                                                placeholder="Confirm password"
                                            />
                                            <InputError message={errors.password_confirmation} />
                                        </div>
                                    </>
                                )}

                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <Button variant="secondary" onClick={closeModal}>
                                            Cancel
                                        </Button>
                                    </DialogClose>

                                    {saveSuccess && (
                                        <span className="text-green-600 font-medium">Saved successfully!</span>
                                    )}

                                    <Button variant="default" disabled={processing} asChild>
                                        <button type="submit">{isEditing ? 'Update User' : 'Add User'}</button>
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {
                        teamMembers.length > 0 && (
                            <div className="flex flex-col">
                                <div className="-m-1.5 overflow-x-auto">
                                    <div className="p-1.5 min-w-full inline-block align-middle">
                                        <div className="overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                                                <thead>
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-start text-sm font-medium text-gray-600 dark:text-neutral-500">Name</th>
                                                    <th scope="col" className="px-6 py-3 text-start text-sm font-medium text-gray-600 dark:text-neutral-500">Role</th>
                                                    <th scope="col" className="px-6 py-3 text-start text-sm font-medium text-gray-600 dark:text-neutral-500">Email</th>
                                                    <th scope="col" className="px-6 py-3 text-end text-sm font-medium text-gray-600 dark:text-neutral-500">Action</th>
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                                                {
                                                    teamMembers.map(teamMember => (
                                                        <tr key={teamMember.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-normal text-gray-800 dark:text-neutral-200">{teamMember.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{teamMember.role}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{teamMember.email}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openEditUserModal(teamMember)}
                                                                        className="inline-flex items-center gap-x-2 text-sm font-medium cursor-pointer rounded-lg border border-transparent text-blue-600 hover:text-blue-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="inline-flex items-center gap-x-2 text-sm font-medium cursor-pointer rounded-lg border border-transparent text-red-600 hover:text-red-800 focus:outline-hidden focus:text-red-800 disabled:opacity-50 disabled:pointer-events-none dark:text-red-500 dark:hover:text-red-400 dark:focus:text-red-400"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
            </CompanyLayout>
        </AppLayout>
    );
}
