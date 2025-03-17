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
import {FormEventHandler, useRef, useState} from "react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/company/staff',
    },
];

interface CompanyForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
}

interface TeamMember {
    name: string;
    email: string;
    id: string;
}

export default function Staff({ teamMembers }: { teamMembers: TeamMember[] }) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<Required<CompanyForm>>({
        name: 'Azer Mammadov',
        email: 'azer@gmail.com',
        password: 'Tklm_159753',
        password_confirmation: 'Tklm_159753',
        role: 'staff',
    });

    const closeModal = () => {
        setOpen(false); // Close modal
        clearErrors();
        reset();
    };

    const openModal = () => {
        setOpen(true); // Open modal
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('company.addUser'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal(); // Close modal on success
            },
            onError: () => { },
            onFinish: () => { },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Company staff" />

            <CompanyLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Company staff" description="Add or update your staff" />

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default">Add User</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>Are new user to your company</DialogTitle>
                            <DialogDescription>
                                Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your password
                                to confirm you would like to permanently delete your account.
                            </DialogDescription>
                            <form className="space-y-6" onSubmit={deleteUser}>
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
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="staff">Staff</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role} />
                                </div>

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

                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <Button variant="secondary" onClick={closeModal}>
                                            Cancel
                                        </Button>
                                    </DialogClose>

                                    <Button variant="default" disabled={processing} asChild>
                                        <button type="submit">Add User</button>
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
                                                        <tr>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-normal text-gray-800 dark:text-neutral-200">{teamMember.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">Cashier</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{teamMember.email}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                                                                <div className="flex justify-end gap-2">
                                                                    <button type="button" className="inline-flex items-center gap-x-2 text-sm font-medium cursor-pointer rounded-lg border border-transparent text-blue-600 hover:text-blue-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400">Edit</button>
                                                                    <button type="button" className="inline-flex items-center gap-x-2 text-sm font-medium cursor-pointer rounded-lg border border-transparent text-red-600 hover:text-red-800 focus:outline-hidden focus:text-red-800 disabled:opacity-50 disabled:pointer-events-none dark:text-red-500 dark:hover:text-red-400 dark:focus:text-red-400">Delete</button>
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
