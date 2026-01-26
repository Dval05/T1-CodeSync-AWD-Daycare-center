# 🔐 Sistema de Control de Acceso por Roles y Permisos (RBAC)

## ✅ ¿Qué se implementó?

Se creó un sistema completo de permisos que:

1. **Filtra el menú lateral** - Solo muestra las pestañas según los permisos del usuario
2. **Controla botones** - Oculta/deshabilita botones de Crear, Editar, Eliminar según permisos
3. **Es reutilizable** - Funciona en cualquier página con componentes simples

---

## 📦 Archivos Creados

### Hooks:
- ✅ `client/src/hooks/usePermissions.js` - Hook para verificar permisos del usuario

### Componentes:
- ✅ `client/src/components/permissions/PermissionGate.jsx` - Ocultar/mostrar elementos
- ✅ `client/src/components/permissions/ActionButton.jsx` - Botones con permisos integrados

### Configuración:
- ✅ `client/src/config/menuConfig.js` - Configuración del menú con permisos requeridos

### Documentación:
- ✅ `GUIA_SISTEMA_PERMISOS.md` - Guía completa de uso
- ✅ `initialize_permissions.sql` - Script SQL para crear permisos y roles

### Modificaciones:
- ✅ `client/src/components/layout/Sidebar.jsx` - Ahora filtra menú según permisos
- ✅ `client/src/pages/Students.jsx` - Ejemplo de implementación

---

## 🚀 Pasos para Activar el Sistema

### 1. Ejecutar SQL en Supabase

Ve a **Supabase Dashboard** → **SQL Editor** y ejecuta el archivo:

📄 [initialize_permissions.sql](initialize_permissions.sql)

Esto creará:
- 50+ permisos básicos (student.view, student.create, etc.)
- 5 roles predefinidos (Administrador, Profesor, Secretaria, Viewer, Responsable)
- Asignación automática de permisos a roles

### 2. Asignar un Rol a tu Usuario

En Supabase, ejecuta:

```sql
-- Reemplaza 'andrade.dval@gmail.com' con tu email
-- y 'Administrador' con el rol que desees

INSERT INTO public."user_role" ("UserID", "RoleID")
SELECT 
    u."UserID",
    r."RoleID"
FROM public."user" u, public."role" r
WHERE u."Email" = 'andrade.dval@gmail.com'
  AND r."RoleName" = 'Administrador';
```

### 3. Reiniciar el Frontend

```powershell
cd client
# Detener con Ctrl+C y reiniciar
npm run dev
```

### 4. Probar el Sistema

- ✅ Inicia sesión con tu usuario
- ✅ Verifica que el menú lateral muestre solo las opciones permitidas
- ✅ Ve a **Estudiantes** y verifica que los botones aparezcan según tus permisos
- ✅ Crea otro usuario con rol "Viewer" y verifica que solo pueda ver (sin botones de editar/eliminar)

---

## 📋 Roles Predefinidos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Administrador** | Acceso total | Todos los permisos (*.view, *.create, *.update, *.delete) |
| **Profesor** | Gestión académica | Estudiantes (view, update), Asistencia, Actividades, Tareas |
| **Secretaria** | Administración | Estudiantes, Responsables, Facturas, Pagos |
| **Viewer** | Solo lectura | Todos los *.view (sin crear, editar ni eliminar) |
| **Responsable** | Padres/Tutores | Ver estudiantes, actividades, pagos (solo sus hijos) |

---

## 🛠️ Cómo Usar en Otras Páginas

### Ejemplo 1: Botón con permiso

```jsx
import { ActionButton } from '../components/permissions/ActionButton';

<ActionButton
    resource="invoice"
    action="create"
    onClick={handleCreateInvoice}
    label="Nueva Factura"
/>
```

### Ejemplo 2: Ocultar sección completa

```jsx
import { PermissionGate } from '../components/permissions/PermissionGate';

<PermissionGate permission="invoice.export">
    <button onClick={handleExport}>Exportar PDF</button>
</PermissionGate>
```

### Ejemplo 3: Lógica condicional

```jsx
import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
    const { can } = usePermissions();

    if (can('student', 'delete')) {
        // Mostrar columna de eliminar
    }
}
```

---

## 📊 Gestión de Roles y Permisos

### Vía Interfaz:

Ve a la página **Roles y Permisos** (`/roles`) para:
- ✅ Ver roles existentes
- ✅ Crear nuevos roles
- ✅ Asignar permisos a roles
- ✅ Ver permisos disponibles

### Vía SQL:

```sql
-- Crear nuevo permiso
INSERT INTO public."permission" ("PermissionName", "Description")
VALUES ('report.export', 'Exportar reportes');

-- Asignar permiso a rol
INSERT INTO public."role_permission" ("RoleID", "PermissionID")
VALUES (1, 50); -- RoleID 1 = Administrador, PermissionID 50 = nuevo permiso
```

---

## 🔍 Verificar Permisos de un Usuario

```sql
-- Ver permisos de un usuario específico
SELECT 
    u."Email",
    r."RoleName",
    p."PermissionName",
    p."Description"
FROM public."user" u
INNER JOIN public."user_role" ur ON u."UserID" = ur."UserID"
INNER JOIN public."role" r ON ur."RoleID" = r."RoleID"
INNER JOIN public."role_permission" rp ON r."RoleID" = rp."RoleID"
INNER JOIN public."permission" p ON rp."PermissionID" = p."PermissionID"
WHERE u."Email" = 'andrade.dval@gmail.com'
ORDER BY p."PermissionName";
```

---

## 📖 Documentación Completa

Lee la guía completa en: [GUIA_SISTEMA_PERMISOS.md](GUIA_SISTEMA_PERMISOS.md)

Incluye:
- Ejemplos de código detallados
- Migración de páginas existentes
- Estructura de base de datos
- Solución de problemas

---

## ✅ Checklist de Implementación

- [ ] Ejecutar [initialize_permissions.sql](initialize_permissions.sql) en Supabase
- [ ] Asignar rol "Administrador" a tu usuario
- [ ] Reiniciar el frontend
- [ ] Probar que el menú se filtra correctamente
- [ ] Verificar botones en página Students
- [ ] Aplicar `ActionButton` en otras páginas (Invoices, Grades, etc.)
- [ ] Crear usuarios de prueba con diferentes roles
- [ ] Probar acceso con cada rol

---

## 🆘 Solución de Problemas

### No aparece ningún menú:
- Verifica que tu usuario tenga un rol asignado en `user_role`
- Verifica que el rol tenga permisos en `role_permission`

### Los botones no se ocultan:
- Revisa la consola del navegador (F12) para errores
- Verifica que los nombres de permisos coincidan exactamente (ej: `student.view`, no `Student.View`)

### Error al cargar permisos:
- Verifica que las tablas `role`, `permission`, `user_role`, `role_permission` existan en Supabase
- Ejecuta el SQL de verificación en el archivo `initialize_permissions.sql`

---

## 📞 Próximos Pasos

1. **Implementa en todas las páginas** - Usa `ActionButton` en Invoices, Grades, Guardians, etc.
2. **Protege rutas** - Opcional: Agregar validación de permisos en las rutas de React Router
3. **Backend** - Opcional: Validar permisos también en el backend para mayor seguridad
4. **Auditoría** - Registrar en `audit_log` cuando usuarios sin permisos intenten acceder

---

## 🎉 ¡Listo!

Tu sistema ahora tiene control de acceso basado en roles. Cada usuario solo verá y podrá hacer lo que sus permisos le permitan.
