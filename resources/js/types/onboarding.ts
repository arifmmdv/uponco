import type { Location, SelectOption } from './locations';
import type { Service, ServiceCategory } from './services';
import type {
    RoleOption,
    TeamInvitation,
    TeamMember,
    TeamPermissions,
} from './teams';
import type { WeeklySchedule } from './work-hours';

export type OnboardingStepKey =
    | 'general'
    | 'members'
    | 'locations'
    | 'services'
    | 'profile'
    | 'work_hours';

export type OnboardingStepStatus = 'pending' | 'completed' | 'skipped';

export type OnboardingStepInfo = {
    key: OnboardingStepKey;
    label: string;
    status: OnboardingStepStatus;
    mandatory: boolean;
};

export type OnboardingProfile = {
    name: string;
    email: string | null;
    phone: string | null;
    job_title: string | null;
    description: string | null;
};

export type Onboarding = {
    currentStep: OnboardingStepKey;
    steps: OnboardingStepInfo[];
    general: {
        timezone: string | null;
        timezones: SelectOption[];
    };
    members: {
        members: TeamMember[];
        invitations: TeamInvitation[];
        availableRoles: RoleOption[];
        permissions: TeamPermissions;
    };
    locations: {
        locations: Location[];
        services: SelectOption[];
        specialists: SelectOption[];
        countries: SelectOption[];
        timezones: SelectOption[];
    };
    services: {
        categories: ServiceCategory[];
        services: Service[];
        locations: SelectOption[];
        specialists: SelectOption[];
        priceTypes: SelectOption[];
        serviceTypes: SelectOption[];
        deliveryTypes: SelectOption[];
        meetingProviders: SelectOption[];
    };
    profile: OnboardingProfile;
    workHours: {
        schedule: WeeklySchedule;
    };
};
