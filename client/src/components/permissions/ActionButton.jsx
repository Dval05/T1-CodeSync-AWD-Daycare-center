import React from 'react';
import { Plus, Edit, Trash2, Eye, Download, Upload } from 'lucide-react';
import { PermissionGate } from './PermissionGate';
import { AdminGate } from './AdminGate';

export const ActionButton = ({
    resource,
    action,
    onClick,
    label,
    variant = 'primary',
    disabled = false,
    icon: CustomIcon,
    className = '',
    requireAdmin = false,
    iconOnly = false,
    ...rest
}) => {
    const permission = `${resource}.${action}`;

    // Mapeo de iconos por acción
    const defaultIcons = {
        create: Plus,
        update: Edit,
        delete: Trash2,
        view: Eye,
        export: Download,
        import: Upload
    };

    // Mapeo de estilos por variante
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
    };

    const Icon = CustomIcon || defaultIcons[action] || Plus;

    const button = (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                flex items-center ${iconOnly ? '' : 'gap-2'} ${iconOnly ? 'p-2 rounded-full' : 'px-4 py-2 rounded-lg'} font-medium
                transition-all duration-200
                ${variants[variant] || variants.primary}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
                ${className}
            `}
            {...rest}
        >
            <Icon size={18} />
            {iconOnly ? (<span className="sr-only">{label}</span>) : label}
        </button>
    );

    const gatedByPermission = (
        <PermissionGate permission={permission}>
            {button}
        </PermissionGate>
    );

    return requireAdmin ? (
        <AdminGate>
            {gatedByPermission}
        </AdminGate>
    ) : (
        gatedByPermission
    );
};










export const CrudButtons = ({
    resource,
    onNew,
    onEdit,
    onDelete,
    hasSelection = false
}) => {
    return (
        <div className="flex gap-2">
            {onNew && (
                <ActionButton
                    resource={resource}
                    action="create"
                    onClick={onNew}
                    label="Nuevo"
                    variant="primary"
                />
            )}
            {onEdit && (
                <ActionButton
                    resource={resource}
                    action="update"
                    onClick={onEdit}
                    label="Editar"
                    variant="secondary"
                    disabled={!hasSelection}
                />
            )}
            {onDelete && (
                <ActionButton
                    resource={resource}
                    action="delete"
                    onClick={onDelete}
                    label="Eliminar"
                    variant="danger"
                    disabled={!hasSelection}
                />
            )}
        </div>
    );
};







export const PermissionButton = ({ permission, children, ...rest }) => {
    return (
        <PermissionGate permission={permission}>
            <button {...rest}>
                {children}
            </button>
        </PermissionGate>
    );
};
