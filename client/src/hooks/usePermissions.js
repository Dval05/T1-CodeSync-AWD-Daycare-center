import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar permisos del usuario
 * Los permisos se cargan UNA VEZ al iniciar sesión y se mantienen en memoria
 * @returns {Object} - Permisos y funciones de verificación
 */
export const usePermissions = () => {
    const { permissions, permissionsLoaded } = useAuth();

    /**
     * Verifica si el usuario tiene un permiso específico por nombre
     * @param {string} permissionName - Nombre del permiso (ej: "student.view")
     * @returns {boolean}
     */
    const hasPermission = (permissionName) => {
        return permissions.some(p => p.PermissionName === permissionName);
    };

    /**
     * Verifica si el usuario tiene alguno de los permisos especificados
     * @param {string[]} permissionNames - Array de nombres de permisos
     * @returns {boolean}
     */
    const hasAnyPermission = (permissionNames) => {
        // Si no hay permisos requeridos, permitir acceso
        if (!permissionNames || permissionNames.length === 0) {
            return true;
        }
        return permissionNames.some(name => hasPermission(name));
    };

    /**
     * Verifica si el usuario tiene todos los permisos especificados
     * @param {string[]} permissionNames - Array de nombres de permisos
     * @returns {boolean}
     */
    const hasAllPermissions = (permissionNames) => {
        return permissionNames.every(name => hasPermission(name));
    };

    /**
     * Verifica si el usuario puede realizar una acción en un recurso
     * @param {string} resource - Nombre del recurso (ej: "student")
     * @param {string} action - Acción (ej: "view", "create", "update", "delete")
     * @returns {boolean}
     */
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
