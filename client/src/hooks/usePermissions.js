import { useAuth } from '../context/AuthContext';






export const usePermissions = () => {
    const { permissions, permissionsLoaded } = useAuth();

    




    const hasPermission = (permissionName) => {
        return permissions.some(p => p.PermissionName === permissionName);
    };

    




    const hasAnyPermission = (permissionNames) => {
        
        if (!permissionNames || permissionNames.length === 0) {
            return true;
        }
        return permissionNames.some(name => hasPermission(name));
    };

    




    const hasAllPermissions = (permissionNames) => {
        return permissionNames.every(name => hasPermission(name));
    };

    





    const can = (resource, action) => {
        return hasPermission(`${resource}.${action}`);
    };

    return {
        permissions,
        loading: !permissionsLoaded,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        can
    };
};
