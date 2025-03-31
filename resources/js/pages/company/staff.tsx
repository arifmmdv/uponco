import { StaffProvider, TeamMember, useStaff } from './staff/StaffContext';
import { TeamMembersList } from './staff/TeamMembersList';
import { UserFormDialog } from './staff/UserFormDialog';
import { DeleteMemberConfirmation } from './staff/DeleteMemberConfirmation';
import { Head } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import CompanyLayout from "@/layouts/company/layout";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Company staff',
        href: '/company/staff',
    },
];

interface StaffPageProps {
    teamMembers: TeamMember[];
    currentUserRoles: string[];
}

export default function StaffPage({ teamMembers, currentUserRoles }: StaffPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Company staff" />

            <CompanyLayout>
                <StaffProvider currentUserRoles={currentUserRoles}>
                    <StaffContent teamMembers={teamMembers} />
                </StaffProvider>
            </CompanyLayout>
        </AppLayout>
    );
}

function StaffContent({ teamMembers }: { teamMembers: TeamMember[] }) {
    const { memberToDelete, isDeleteModalOpen, closeDeleteModal } = useStaff();

    return (
        <div className="flex flex-col h-full space-y-6">
            <HeadingSmall title="Company staff" description="Add or update your staff" />

            <UserFormDialog />

            <div className="flex-1 overflow-auto">
                {teamMembers.length > 0 && (
                    <TeamMembersList teamMembers={teamMembers} />
                )}
            </div>

            {/* Delete confirmation modal */}
            <DeleteMemberConfirmation
                teamMember={memberToDelete}
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
            />
        </div>
    );
}
