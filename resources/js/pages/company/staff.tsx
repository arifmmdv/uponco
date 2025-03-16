import { Head } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import CompanyLayout from "@/layouts/company/layout";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/company/staff',
    },
];

export default function Staff() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Company staff" />

            <CompanyLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Company staff" description="Add or update your staff" />
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
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-normal text-gray-800 dark:text-neutral-200">Sevinj Mammadova</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">Cashier</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">sevinj@gmail.com</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button type="button" className="inline-flex items-center gap-x-2 text-sm font-medium cursor-pointer rounded-lg border border-transparent text-blue-600 hover:text-blue-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400">Edit</button>
                                                    <button type="button" className="inline-flex items-center gap-x-2 text-sm font-medium cursor-pointer rounded-lg border border-transparent text-red-600 hover:text-red-800 focus:outline-hidden focus:text-red-800 disabled:opacity-50 disabled:pointer-events-none dark:text-red-500 dark:hover:text-red-400 dark:focus:text-red-400">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CompanyLayout>
        </AppLayout>
    );
}
