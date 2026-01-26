import { 
    LayoutDashboard, Users, GraduationCap, CalendarDays, 
    FileText, UserCheck, DollarSign, Bolt, Shield, Bell, Award, UserCircle
} from 'lucide-react';

/**
 * Configuración de rutas con sus permisos requeridos
 * 
 * Estructura de permisos:
 * - {resource}.view: Ver listado
 * - {resource}.create: Crear nuevo registro
 * - {resource}.update: Editar registro existente
 * - {resource}.delete: Eliminar registro
 */
export const MENU_CONFIG = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        permissions: [] // Sin permisos requeridos - todos pueden ver el dashboard
    },
    {
        label: 'Auditoría',
        path: '/audit',
        icon: FileText,
        permissions: ['attendance.view']
    },
    {
        label: 'Actividades',
        path: '/activities',
        icon: CalendarDays,
        permissions: ['activity.view']
    },
    {
        label: 'Gestor de Actividades',
        path: '/activity-manager',
        icon: CalendarDays,
        permissions: ['activity.create', 'activity.update']
    },
    {
        label: 'Estudiantes',
        path: '/students',
        icon: GraduationCap,
        permissions: ['student.view']
    },
    {
        label: 'Grupos',
        path: '/grades',
        icon: Award,
        permissions: ['grade.view']
    },
    {
        label: 'Alta Rápida',
        path: '/intake',
        icon: Bolt,
        permissions: ['student.create']
    },
    {
        label: 'Asistencia',
        path: '/attendance',
        icon: UserCheck,
        permissions: ['attendance.view']
    },
    {
        label: 'Pagos',
        path: '/payments',
        icon: DollarSign,
        permissions: ['student_payment.view']
    },
    {
        label: 'Facturas',
        path: '/invoices',
        icon: FileText,
        permissions: ['invoice.view']
    },
    {
        label: 'Responsables',
        path: '/guardians',
        icon: Users,
        permissions: ['guardian.view']
    },
    {
        label: 'Personal',
        path: '/staff',
        icon: Users,
        permissions: ['employee.view']
    },
    {
        label: 'Usuarios',
        path: '/users',
        icon: Users,
        permissions: ['user.view']
    },
    {
        label: 'Roles y Permisos',
        path: '/roles',
        icon: Shield,
        permissions: ['role.view', 'permission.view']
    },
    {
        label: 'Notificaciones',
        path: '/notifications',
        icon: Bell,
        permissions: ['notification.view']
    },
    {
        label: 'Tareas',
        path: '/tasks',
        icon: FileText,
        permissions: ['employee_task.view']
    },
    {
        label: 'Mi Perfil',
        path: '/profile',
        icon: UserCircle,
        permissions: [] // Todos los usuarios pueden ver su perfil
    }
];

/**
 * Mapeo de acciones CRUD por recurso
 */
export const RESOURCE_ACTIONS = {
    // Botones comunes
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    VIEW: 'view',
    
    // Acciones especiales
    EXPORT: 'export',
    IMPORT: 'import',
    ASSIGN: 'assign'
};
