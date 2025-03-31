import { createContext, useState, useContext, ReactNode } from 'react';
import { useForm } from '@inertiajs/react';

export interface TeamMemberForm {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    role: string;
    id?: string;
}

export interface TeamMemberRole {
    name: string;
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    roles: TeamMemberRole[];
}

interface StaffContextProps {
    currentUserRoles: string[];
}

interface StaffContextType {
    // Dialog state
    open: boolean;
    setOpen: (open: boolean) => void;

    // Form state
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
    currentUserId: string | null;
    setCurrentUserId: (id: string | null) => void;
    saveSuccess: boolean;
    setSaveSuccess: (success: boolean) => void;

    // Delete state
    memberToDelete: TeamMember | null;
    setMemberToDelete: (member: TeamMember | null) => void;
    isDeleteModalOpen: boolean;
    setIsDeleteModalOpen: (open: boolean) => void;

    // Role permissions
    canDeleteMembers: boolean;

    // Form data and methods
    data: Required<TeamMemberForm>;
    setData: (key: keyof TeamMemberForm, value: string) => void;
    setDataAll: (data: Required<TeamMemberForm>) => void;
    errors: Record<string, string>;
    processing: boolean;

    // Actions
    closeModal: () => void;
    openAddUserModal: () => void;
    openEditUserModal: (teamMember: TeamMember) => void;
    openDeleteModal: (teamMember: TeamMember) => void;
    closeDeleteModal: () => void;
    submitForm: (e: React.FormEvent) => void;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children, currentUserRoles }: StaffContextProps & { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Delete functionality state
    const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Check if user has permission to delete members
    const canDeleteMembers = currentUserRoles.includes('company-owner');

    const { data, setData: setFormData, post, processing, reset, errors, clearErrors } = useForm<Required<TeamMemberForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'staff',
        id: '',
    });

    const setData = (key: keyof TeamMemberForm, value: string) => {
        setFormData(key, value);
    };

    const setDataAll = (newData: Required<TeamMemberForm>) => {
        Object.keys(newData).forEach((key) => {
            setFormData(key as keyof TeamMemberForm, newData[key as keyof TeamMemberForm]);
        });
    };

    const closeModal = () => {
        setOpen(false);
        clearErrors();
        reset();
        setIsEditing(false);
        setCurrentUserId(null);
    };

    const openAddUserModal = () => {
        setIsEditing(false);
        setDataAll({
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
        setDataAll({
            name: teamMember.name,
            email: teamMember.email,
            role: 'staff',
            password: '',
            password_confirmation: '',
            id: teamMember.id,
        });
        setOpen(true);
    };

    const openDeleteModal = (teamMember: TeamMember) => {
        setMemberToDelete(teamMember);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setMemberToDelete(null);
    };

    const submitForm = (e: React.FormEvent) => {
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
        <StaffContext.Provider
            value={{
                open,
                setOpen,
                isEditing,
                setIsEditing,
                currentUserId,
                setCurrentUserId,
                saveSuccess,
                setSaveSuccess,
                memberToDelete,
                setMemberToDelete,
                isDeleteModalOpen,
                setIsDeleteModalOpen,
                canDeleteMembers,
                data,
                setData,
                setDataAll,
                errors,
                processing,
                closeModal,
                openAddUserModal,
                openEditUserModal,
                openDeleteModal,
                closeDeleteModal,
                submitForm
            }}
        >
            {children}
        </StaffContext.Provider>
    );
}

export function useStaff() {
    const context = useContext(StaffContext);
    if (context === undefined) {
        throw new Error('useStaff must be used within a StaffProvider');
    }
    return context;
}
