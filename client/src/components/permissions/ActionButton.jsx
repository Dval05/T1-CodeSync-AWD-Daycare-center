import React from 'react';
import { Plus, Edit, Trash2, Eye, Download, Upload } from 'lucide-react';
import { PermissionGate } from './PermissionGate';
import { AdminGate } from './AdminGate';

/**
 * Botón de acción con control de permisos
 * @param {Object} props
 * @param {string} props.resource - Nombre del recurso (ej: 'student', 'invoice')
 * @param {string} props.action - Acción (create, update, delete, view, export, import)
 * @param {Function} props.onClick - Función al hacer clic
 * @param {string} props.label - Texto del botón
 * @param {string} props.variant - Estilo del botón (primary, danger, success, secondary)
 * @param {boolean} props.disabled - Si el botón está deshabilitado
 * @param {React.ReactNode} props.icon - Ícono personalizado
 */
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

/**
 * Grupo de botones CRUD estándar
 * @param {Object} props
 * @param {string} props.resource - Nombre del recurso
 * @param {Function} props.onNew - Callback para crear nuevo
 * @param {Function} props.onEdit - Callback para editar
 * @param {Function} props.onDelete - Callback para eliminar
 * @param {boolean} props.hasSelection - Si hay un elemento seleccionado
 */
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

/**
 * Botón simple con control de permisos (sin estilo predefinido)
 * @param {Object} props
 * @param {string|string[]} props.permission - Permiso(s) requerido(s)
 * @param {React.ReactNode} props.children - Contenido del botón
 */
export const PermissionButton = ({ permission, children, ...rest }) => {
    return (
        <PermissionGate permission={permission}>
            <button {...rest}>
                {children}
            </button>
        </PermissionGate>
    );
};
