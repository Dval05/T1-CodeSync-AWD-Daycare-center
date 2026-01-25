-- =====================================================
-- Script para Inicializar Permisos del Sistema
-- =====================================================
-- Ejecutar este script en Supabase SQL Editor

-- 0. AGREGAR CONSTRAINTS DE UNICIDAD (si no existen)
-- =====================================================

-- Agregar constraint de unicidad a PermissionName si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'permission_PermissionName_key'
    ) THEN
        ALTER TABLE public."permission" 
        ADD CONSTRAINT "permission_PermissionName_key" UNIQUE ("PermissionName");
    END IF;
END $$;

-- Agregar constraint de unicidad a RoleName si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'role_RoleName_key'
    ) THEN
        ALTER TABLE public."role" 
        ADD CONSTRAINT "role_RoleName_key" UNIQUE ("RoleName");
    END IF;
END $$;

-- 1. INSERTAR PERMISOS BÁSICOS
-- =====================================================

-- Permisos para Estudiantes
INSERT INTO public."permission" ("PermissionName", "Module", "Action", "Description") VALUES
('student.view', 'student', 'view', 'Ver listado de estudiantes'),
('student.create', 'student', 'create', 'Crear nuevos estudiantes'),
('student.update', 'student', 'update', 'Editar datos de estudiantes'),
('student.delete', 'student', 'delete', 'Eliminar estudiantes')
ON CONFLICT ("PermissionName") DO NOTHING;

-- Permisos para Grupos/Grados
INSERT INTO public."permission" ("PermissionName", "Module", "Action", "Description") VALUES
('grade.view', 'grade', 'view', 'Ver listado de grupos'),
('grade.create', 'grade', 'create', 'Crear nuevos grupos'),
('grade.update', 'grade', 'update', 'Editar grupos'),
('grade.delete', 'grade', 'delete', 'Eliminar grupos')
ON CONFLICT ("PermissionName") DO NOTHING;

-- Permisos para Actividades
INSERT INTO public."permission" ("PermissionName", "Module", "Action", "Description") VALUES
('activity.view', 'activity', 'view', 'Ver actividades'),
('activity.create', 'activity', 'create', 'Crear actividades'),
('activity.update', 'activity', 'update', 'Editar actividades'),
('activity.delete', 'activity', 'delete', 'Eliminar actividades')
ON CONFLICT ("PermissionName") DO NOTHING;

-- Permisos para Asistencia
INSERT INTO public."permission" ("PermissionName", "Module", "Action", "Description") VALUES
('attendance.view', 'attendance', 'view', 'Ver registros de asistencia'),
('attendance.create', 'attendance', 'create', 'Registrar asistencia'),
('attendance.update', 'attendance', 'update', 'Modificar asistencia'),
('attendance.delete', 'attendance', 'delete', 'Eliminar registros de asistencia')
ON CONFLICT ("PermissionName") DO NOTHING;

-- Permisos para Pagos
INSERT INTO public."permission" ("PermissionName", "Module", "Action", "Description") VALUES
('student_payment.view', 'student_payment', 'view', 'Ver pagos de estudiantes'),
('student_payment.create', 'student_payment', 'create', 'Registrar pagos'),
('student_payment.update', 'student_payment', 'update', 'Modificar pagos'),
('student_payment.delete', 'student_payment', 'delete', 'Eliminar registros de pagos')
ON CONFLICT ("PermissionName") DO NOTHING;

-- Permisos para Facturas
INSERT INTO public."permission" ("PermissionName", "Module", "Action", "Description") VALUES
('invoice.view', 'invoice', 'view', 'Ver facturas'),
('invoice.create', 'invoice', 'create', 'Generar facturas'),
('invoice.update', 'invoice', 'update', 'Modificar facturas'),
('invoice.delete', 'invoice', 'delete', 'Eliminar facturas'),
('invoice.export', 'invoice', 'export', 'Exportar facturas a PDF/Excel')
ON CONFLICT ("PermissionName") DO NOTHING;

-- Permisos para Responsables
INSERT INTO public."permission" ("PermissionName", "Module", "Action", "Description") VALUES
('guardian.view', 'guardian', 'view', 'Ver listado de responsables'),
('guardian.create', 'guardian', 'create', 'Agregar responsables'),
('guardian.update', 'guardian', 'update', 'Editar responsables'),
('guardian.delete', 'guardian', 'delete', 'Eliminar responsables')
ON CONFLICT ("PermissionName") DO NOTHING;

-- Permisos para Personal/Empleados
INSERT INTO public."permission" ("PermissionName", "Module", "Action", "Description") VALUES
('employee.view', 'employee', 'view', 'Ver personal'),
('employee.create', 'employee', 'create', 'Contratar personal'),
('employee.update', 'employee', 'update', 'Editar datos de personal'),
('employee.delete', 'employee', 'delete', 'Dar de baja personal')
ON CONFLICT ("PermissionName") DO NOTHING;

-- Permisos para Tareas
INSERT INTO public."permission" ("PermissionName", "Module", "Action", "Description") VALUES
('employee_task.view', 'employee_task', 'view', 'Ver tareas asignadas'),
('employee_task.create', 'employee_task', 'create', 'Asignar tareas'),
('employee_task.update', 'employee_task', 'update', 'Modificar tareas'),
('employee_task.delete', 'employee_task', 'delete', 'Eliminar tareas')
ON CONFLICT ("PermissionName") DO NOTHING;

-- Permisos para Usuarios
INSERT INTO public."permission" ("PermissionName", "Module", "Action", "Description") VALUES
('user.view', 'user', 'view', 'Ver usuarios del sistema'),
('user.create', 'user', 'create', 'Crear nuevos usuarios'),
('user.update', 'user', 'update', 'Editar usuarios'),
('user.delete', 'user', 'delete', 'Eliminar usuarios')
ON CONFLICT ("PermissionName") DO NOTHING;

-- Permisos para Roles
INSERT INTO public."permission" ("PermissionName", "Module", "Action", "Description") VALUES
('role.view', 'role', 'view', 'Ver roles'),
('role.create', 'role', 'create', 'Crear roles'),
('role.update', 'role', 'update', 'Editar roles'),
('role.delete', 'role', 'delete', 'Eliminar roles')
ON CONFLICT ("PermissionName") DO NOTHING;

-- Permisos para Permisos (meta)
INSERT INTO public."permission" ("PermissionName", "Module", "Action", "Description") VALUES
('permission.view', 'permission', 'view', 'Ver permisos disponibles'),
('permission.create', 'permission', 'create', 'Crear nuevos permisos'),
('permission.update', 'permission', 'update', 'Editar permisos'),
('permission.delete', 'permission', 'delete', 'Eliminar permisos')
ON CONFLICT ("PermissionName") DO NOTHING;

-- Permisos para Notificaciones
INSERT INTO public."permission" ("PermissionName", "Module", "Action", "Description") VALUES
('notification.view', 'notification', 'view', 'Ver notificaciones'),
('notification.create', 'notification', 'create', 'Enviar notificaciones'),
('notification.update', 'notification', 'update', 'Editar notificaciones'),
('notification.delete', 'notification', 'delete', 'Eliminar notificaciones')
ON CONFLICT ("PermissionName") DO NOTHING;

-- 2. CREAR ROLES BÁSICOS
-- =====================================================

-- Rol: Admin
INSERT INTO public."role" ("RoleName", "Description") VALUES
('Admin', 'Acceso completo al sistema')
ON CONFLICT ("RoleName") DO NOTHING;

-- Rol: Profesor
INSERT INTO public."role" ("RoleName", "Description") VALUES
('Profesor', 'Acceso a estudiantes, asistencia y actividades')
ON CONFLICT ("RoleName") DO NOTHING;

-- Rol: Responsable
INSERT INTO public."role" ("RoleName", "Description") VALUES
('Responsable', 'Acceso limitado a información de sus hijos')
ON CONFLICT ("RoleName") DO NOTHING;

-- Rol: Secretaria
INSERT INTO public."role" ("RoleName", "Description") VALUES
('Secretaria', 'Acceso a registros y facturación')
ON CONFLICT ("RoleName") DO NOTHING;

-- Rol: Viewer (Solo lectura)
INSERT INTO public."role" ("RoleName", "Description") VALUES
('Viewer', 'Solo puede ver información, sin editar')
ON CONFLICT ("RoleName") DO NOTHING;

-- 3. ASIGNAR PERMISOS A ROLES
-- =====================================================

-- ADMIN: Todos los permisos
INSERT INTO public."role_permission" ("RoleID", "PermissionID")
SELECT 
    (SELECT "RoleID" FROM public."role" WHERE "RoleName" = 'Admin'),
    "PermissionID"
FROM public."permission"
ON CONFLICT DO NOTHING;

-- PROFESOR: Estudiantes, asistencia, actividades (view, create, update)
INSERT INTO public."role_permission" ("RoleID", "PermissionID")
SELECT 
    (SELECT "RoleID" FROM public."role" WHERE "RoleName" = 'Profesor'),
    "PermissionID"
FROM public."permission"
WHERE "PermissionName" IN (
    'student.view', 'student.update',
    'grade.view',
    'activity.view', 'activity.create', 'activity.update',
    'attendance.view', 'attendance.create', 'attendance.update',
    'employee_task.view',
    'notification.view'
)
ON CONFLICT DO NOTHING;

-- SECRETARIA: Facturación, pagos, registros (view, create, update)
INSERT INTO public."role_permission" ("RoleID", "PermissionID")
SELECT 
    (SELECT "RoleID" FROM public."role" WHERE "RoleName" = 'Secretaria'),
    "PermissionID"
FROM public."permission"
WHERE "PermissionName" IN (
    'student.view', 'student.create', 'student.update',
    'guardian.view', 'guardian.create', 'guardian.update',
    'invoice.view', 'invoice.create', 'invoice.update', 'invoice.export',
    'student_payment.view', 'student_payment.create', 'student_payment.update',
    'attendance.view',
    'notification.view', 'notification.create'
)
ON CONFLICT DO NOTHING;

-- VIEWER: Solo permisos de ver (*.view)
INSERT INTO public."role_permission" ("RoleID", "PermissionID")
SELECT 
    (SELECT "RoleID" FROM public."role" WHERE "RoleName" = 'Viewer'),
    "PermissionID"
FROM public."permission"
WHERE "PermissionName" LIKE '%.view'
ON CONFLICT DO NOTHING;

-- RESPONSABLE: Ver información de estudiantes, actividades, pagos
INSERT INTO public."role_permission" ("RoleID", "PermissionID")
SELECT 
    (SELECT "RoleID" FROM public."role" WHERE "RoleName" = 'Responsable'),
    "PermissionID"
FROM public."permission"
WHERE "PermissionName" IN (
    'student.view',
    'activity.view',
    'attendance.view',
    'student_payment.view',
    'invoice.view',
    'notification.view'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver todos los permisos creados
SELECT "PermissionID", "PermissionName", "Description"
FROM public."permission"
ORDER BY "PermissionName";

-- Ver roles creados
SELECT "RoleID", "RoleName", "Description"
FROM public."role"
ORDER BY "RoleName";

-- Ver permisos por rol
SELECT 
    r."RoleName",
    p."PermissionName",
    p."Description"
FROM public."role_permission" rp
INNER JOIN public."role" r ON rp."RoleID" = r."RoleID"
INNER JOIN public."permission" p ON rp."PermissionID" = p."PermissionID"
ORDER BY r."RoleName", p."PermissionName";

-- Contar permisos por rol
SELECT 
    r."RoleName",
    COUNT(rp."PermissionID") as "TotalPermisos"
FROM public."role" r
LEFT JOIN public."role_permission" rp ON r."RoleID" = rp."RoleID"
GROUP BY r."RoleName"
ORDER BY "TotalPermisos" DESC;
