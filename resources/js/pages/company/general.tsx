import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import CompanyLayout from "@/layouts/company/layout";
import {Textarea} from "@/components/ui/textarea";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Company settings',
        href: '/company/general',
    },
];

interface CompanyForm {
    display_name: string;
    description: string;
}

export default function General({ company }: { company: CompanyForm }) {

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<CompanyForm>>({
        display_name: company.display_name,
        description: company.description,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('company.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="General settings" />

            <CompanyLayout>
                <div className="space-y-6">
                    <HeadingSmall title="General information" description="Update your name and email address" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="display_name">Name</Label>

                            <Input
                                id="display_name"
                                className="mt-1 block w-full"
                                value={data.display_name}
                                onChange={(e) => setData('display_name', e.target.value)}
                                required
                                autoComplete="display_name"
                                placeholder="Display Name"
                            />

                            <InputError className="mt-2" message={errors.display_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>

                            <Textarea
                                id="description"
                                className="mt-1 block w-full"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                required
                                autoComplete="description"
                                placeholder="Description"
                            />

                            <InputError className="mt-2" message={errors.description} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </CompanyLayout>
        </AppLayout>
    );
}
