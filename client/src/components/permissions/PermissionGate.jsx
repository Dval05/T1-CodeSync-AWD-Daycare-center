import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

export const PermissionGate = ({ 
    permission, 
    requireAll = false, 
    children, 
    fallback = null 
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    
    const permissions = Array.isArray(permission) ? permission : [permission];

    
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
