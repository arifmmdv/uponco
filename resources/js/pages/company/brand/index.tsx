import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import { index as companyIndex } from '@/routes/company';
import { index as brandIndex } from '@/routes/company/brand';

export default function BrandIndex() {
    return (
        <>
            <Head title="Brand" />

            <div className="flex flex-col space-y-6 p-4">
                <Heading
                    variant="small"
                    title="Brand"
                    description="Manage your company brand"
                />
            </div>
        </>
    );
}

BrandIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Company',
            href: props.currentTeam
                ? companyIndex(props.currentTeam.slug)
                : '/',
        },
        {
            title: 'Brand',
            href: props.currentTeam ? brandIndex(props.currentTeam.slug) : '/',
        },
    ],
});
