import Heading from '@/components/heading';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {type NavItem, type SharedData} from '@/types';
import {Link, usePage} from '@inertiajs/react';
import {type PropsWithChildren} from 'react';
import {Permissions} from "@/config/Permissions";
import {useAccessControl} from "@/hooks/useAccessControl";

const sidebarNavItems: NavItem[] = [
    {
        title: 'General',
        href: '/company/general',
        icon: null,
        permissions: [Permissions.EditCompany]
    },
    {
        title: 'Staff',
        href: '/company/staff',
        icon: null,
        permissions: [Permissions.ListStaff]
    },
];

export default function CompanyLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    const { getAccessibleNavItems } = useAccessControl()

    const navItems = getAccessibleNavItems(sidebarNavItems);

    return (
        <div className="px-4 py-6">
            <Heading title="Company" description="Manage your company and your staff" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {navItems.map((item) => (
                            <Button
                                key={item.href}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === item.href,
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <div className="flex-1">
                    <section className="">{children}</section>
                </div>
            </div>
        </div>
    );
}
