import type { TeamRole } from '@/types';

/**
 * Whether the given role can manage the company (business, team, services,
 * locations, brand). Owners and admins are managers; plain members are not.
 */
export function isTeamManager(role: TeamRole | null | undefined): boolean {
    return role === 'owner' || role === 'admin';
}
