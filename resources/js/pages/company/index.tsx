import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, ChevronRight, MapPin, UserCog, Wrench } from 'lucide-react';

import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { index as companyIndex } from '@/routes/company';
import { edit as editBusiness } from '@/routes/company/business';
import { index as locationsIndex } from '@/routes/company/locations';
import { index as servicesIndex } from '@/routes/company/services';
import { edit as editWorkProfile } from '@/routes/company/work-profile';

type Props = {
    stats: {
        locations: number;
        services: number;
    };
};

export default function CompanyIndex({ stats }: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const cards = [
        {
            title: 'Business',
            description: 'Manage your team details and team members.',
            icon: Building2,
            count: undefined,
            href: editBusiness(teamSlug),
        },
        {
            title: 'Work Profile',
            description:
                'Manage your public profile and weekly availability.',
            icon: UserCog,
            count: undefined,
            href: editWorkProfile(teamSlug),
        },
        {
            title: 'Locations',
            description: 'Manage the physical locations for your company.',
            icon: MapPin,
            count: stats.locations,
            href: locationsIndex(teamSlug),
        },
        {
            title: 'Services',
            description:
                'Manage the services and categories your company offers.',
            icon: Wrench,
            count: stats.services,
            href: servicesIndex(teamSlug),
        },
    ];

    return (
        <>
            <Head title="Company" />

            <div className="flex flex-col space-y-6 p-4">
                <Heading
                    variant="small"
                    title="Company"
                    description="Manage your company settings and information"
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <Link
                            key={card.title}
                            href={card.href}
                            className="group"
                            data-test="company-card"
                        >
                            <Card className="h-full transition-colors group-hover:border-primary/40">
                                <CardContent className="flex items-start gap-4">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <card.icon className="size-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium">
                                                {card.title}
                                            </h3>
                                            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {card.description}
                                        </p>
                                        {card.count !== undefined && (
                                            <p className="pt-1 text-2xl font-semibold">
                                                {card.count}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}

CompanyIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Company',
            href: props.currentTeam
                ? companyIndex(props.currentTeam.slug)
                : '/',
        },
    ],
});
