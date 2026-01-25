import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Componente que muestra u oculta elementos según permisos
 * @param {Object} props
 * @param {string|string[]} props.permission - Permiso(s) requerido(s)
 * @param {boolean} props.requireAll - Si es true, requiere TODOS los permisos. Si es false, requiere AL MENOS UNO
 * @param {React.ReactNode} props.children - Contenido a mostrar si tiene permisos
 * @param {React.ReactNode} props.fallback - Contenido alternativo si NO tiene permisos
 */
export const PermissionGate = ({ 
    permission, 
    requireAll = false, 
    children, 
    fallback = null 
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    // Convertir permission a array si es string
    const permissions = Array.isArray(permission) ? permission : [permission];

    // Verificar permisos
    let hasAccess = false;
    
    if (permissions.length === 1) {
        hasAccess = hasPermission(permissions[0]);
    } else if (requireAll) {
        hasAccess = hasAllPermissions(permissions);
    } else {
        hasAccess = hasAnyPermission(permissions);
    }

    return hasAccess ? children : fallback;
};

/**
 * HOC que protege un componente con permisos
 * @param {React.Component} Component - Componente a proteger
 * @param {string|string[]} permissions - Permisos requeridos
 * @param {boolean} requireAll - Si requiere todos los permisos o solo uno
 */
export const withPermission = (Component, permissions, requireAll = false) => {
    return (props) => (
        <PermissionGate 
            permission={permissions} 
            requireAll={requireAll}
            fallback={
                <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                        <p className="text-xl font-semibold text-gray-700 mb-2">
                            Acceso Denegado
                        </p>
                        <p className="text-gray-500">
                            No tienes permisos para acceder a esta sección.
                        </p>
                    </div>
                </div>
            }
        >
            <Component {...props} />
        </PermissionGate>
    );
};
