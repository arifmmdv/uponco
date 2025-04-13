import { Permissions } from "@/config/Permissions";
import { usePage } from "@inertiajs/react";
import type {NavItem, SharedData} from "@/types";

export const useAccessControl = () => {
    const { permissions } = usePage<SharedData>().props;
    const hasPermission = (permission: Permissions): boolean => {
        return permissions.includes(permission);
    }

    const getAccessibleNavItems = (navItems: NavItem[]): NavItem[] => {
        return navItems.filter(item => {
            if (!item.permissions || item.permissions.length === 0) {
                return true;
            }

            return item.permissions.some(permission => permissions.includes(permission));
        });
    }

    return {
        hasPermission,
        getAccessibleNavItems
    }
}
