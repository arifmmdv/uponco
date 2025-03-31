import { TeamMember, useStaff } from './StaffContext';

interface TeamMembersListProps {
    teamMembers: TeamMember[];
}

export function TeamMembersList({ teamMembers }: TeamMembersListProps) {
    const { openEditUserModal } = useStaff();

    if (teamMembers.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500">
                No team members found. Add your first team member!
            </div>
        );
    }

    return (
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
                                {teamMembers.map(teamMember => (
                                    <TeamMemberRow
                                        key={teamMember.id}
                                        teamMember={teamMember}
                                        onEdit={openEditUserModal}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface TeamMemberRowProps {
    teamMember: TeamMember;
    onEdit: (teamMember: TeamMember) => void;
}

function TeamMemberRow({ teamMember, onEdit }: TeamMemberRowProps) {
    const { openDeleteModal, canDeleteMembers } = useStaff();

    return (
        <tr key={teamMember.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-normal text-gray-800 dark:text-neutral-200">{teamMember.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{teamMember.roles.map(item => item.name).join(' ')}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{teamMember.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit(teamMember)}
                        className="inline-flex items-center gap-x-2 text-sm font-medium cursor-pointer rounded-lg border border-transparent text-blue-600 hover:text-blue-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400"
                    >
                        Edit
                    </button>
                    {canDeleteMembers && (
                        <button
                            type="button"
                            onClick={() => openDeleteModal(teamMember)}
                            className="inline-flex items-center gap-x-2 text-sm font-medium cursor-pointer rounded-lg border border-transparent text-red-600 hover:text-red-800 focus:outline-hidden focus:text-red-800 disabled:opacity-50 disabled:pointer-events-none dark:text-red-500 dark:hover:text-red-400 dark:focus:text-red-400"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}
