export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface TeamMemberForm {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    role: string;
    id?: string;
}

export interface TeamMember {
    name: string;
    email: string;
    role: string;
    id: string;
}
