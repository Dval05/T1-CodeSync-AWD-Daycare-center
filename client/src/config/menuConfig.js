import { 
    LayoutDashboard, Users, GraduationCap, CalendarDays, 
    FileText, UserCheck, DollarSign, Bolt, Shield, Bell, 
    Award, UserCircle, BookOpen, Briefcase, Settings
} from 'lucide-react';

export const MENU_CONFIG = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        permissions: []
    },
    {
        id: 'academic',
        label: 'Académico',
        icon: BookOpen,
        permissions: ['student.view', 'grade.view', 'activity.view'],
        children: [
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
            }
        ]
    },
    {
        id: 'operations',
        label: 'Operaciones',
        icon: Briefcase,
        permissions: ['attendance.view', 'employee_task.view', 'student.create'],
        children: [
            {
                label: 'Asistencia',
                path: '/attendance',
                icon: UserCheck,
                permissions: ['attendance.view']
            },
            {
                label: 'Alta Rápida',
                path: '/intake',
                icon: Bolt,
                permissions: ['student.create']
            },
            {
                label: 'Tareas',
                path: '/tasks',
                icon: FileText,
                permissions: ['employee_task.view']
            },
            {
                label: 'Auditoría',
                path: '/audit',
                icon: FileText,
                permissions: ['attendance.view']
            }
        ]
    },
    {
        id: 'financial',
        label: 'Finanzas',
        icon: DollarSign,
        permissions: ['teacher_payment.view', 'invoice.view'],
        children: [
            {
                label: 'Pagos',
                path: '/payments',
                icon: DollarSign,
                permissions: ['teacher_payment.view']
            },
            {
                label: 'Facturas',
                path: '/invoices',
                icon: FileText,
                permissions: ['invoice.view']
            }
        ]
    },
    {
        id: 'people',
        label: 'Personas',
        icon: Users,
        permissions: ['guardian.view', 'employee.view'],
        children: [
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
            }
        ]
    },
    {
        id: 'system',
        label: 'Sistema',
        icon: Settings,
        permissions: ['user.view', 'role.view', 'permission.view'],
        children: [
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
                permissions: []
            }
        ]
    },
    {
        id: 'profile',
        label: 'Mi Perfil',
        path: '/profile',
        icon: UserCircle,
        permissions: []
    }
];

export const RESOURCE_ACTIONS = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    VIEW: 'view',
    EXPORT: 'export',
    IMPORT: 'import',
    ASSIGN: 'assign'
};
