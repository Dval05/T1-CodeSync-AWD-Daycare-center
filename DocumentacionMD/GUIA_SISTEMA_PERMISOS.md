# 🔐 Guía de Implementación - Sistema de Permisos

## 📋 Resumen del Sistema

Se ha implementado un **sistema de control de acceso basado en roles y permisos (RBAC)** que:

1. **Filtra el menú lateral** - Solo muestra pestañas para las que el usuario tiene permisos
2. **Controla botones CRUD** - Oculta/deshabilita botones según permisos
3. **Protege componentes** - Puede envolver cualquier elemento JSX

---

## 🗂️ Estructura de Permisos

### Formato de Permisos

Los permisos siguen el formato: **`{resource}.{action}`**

| Resource | Actions Disponibles | Ejemplos |
|----------|---------------------|----------|
| `student` | view, create, update, delete | `student.view`, `student.create` |
| `grade` | view, create, update, delete | `grade.update`, `grade.delete` |
| `invoice` | view, create, update, delete, export | `invoice.view`, `invoice.export` |
| `user` | view, create, update, delete | `user.create` |
| `role` | view, create, update, delete | `role.view` |
| `permission` | view, create, update, delete | `permission.update` |

---

## 🛠️ Componentes Creados

### 1. `usePermissions` Hook

Hook personalizado para verificar permisos del usuario actual.

**Ubicación**: `client/src/hooks/usePermissions.js`

**Uso**:
```jsx
import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
    const { 
        permissions,        // Array de todos los permisos del usuario
        loading,           // true mientras carga permisos
        hasPermission,     // (permissionName) => boolean
        hasAnyPermission,  // (permissionNames[]) => boolean
        hasAllPermissions, // (permissionNames[]) => boolean
        can                // (resource, action) => boolean
    } = usePermissions();

    // Ejemplos:
    if (can('student', 'create')) {
        // Usuario puede crear estudiantes
    }

    if (hasPermission('invoice.export')) {
        // Usuario puede exportar facturas
    }
}
```

---

### 2. `PermissionGate` Componente

Muestra u oculta elementos según permisos.

**Ubicación**: `client/src/components/permissions/PermissionGate.jsx`

**Uso básico**:
```jsx
import { PermissionGate } from '../components/permissions/PermissionGate';

<PermissionGate permission="student.create">
    <button>Crear Estudiante</button>
</PermissionGate>
```

**Con múltiples permisos**:
```jsx
// Requiere AL MENOS UNO de los permisos
<PermissionGate permission={['student.create', 'student.update']}>
    <button>Acción Permitida</button>
</PermissionGate>

// Requiere TODOS los permisos
<PermissionGate 
    permission={['invoice.view', 'invoice.export']} 
    requireAll={true}
>
    <button>Exportar Facturas</button>
</PermissionGate>
```

**Con fallback** (contenido alternativo):
```jsx
<PermissionGate 
    permission="student.delete"
    fallback={<span className="text-gray-400">Sin acceso</span>}
>
    <button className="text-red-600">Eliminar</button>
</PermissionGate>
```

---

### 3. `ActionButton` Componente

Botones de acción con permisos integrados.

**Ubicación**: `client/src/components/permissions/ActionButton.jsx`

**Uso**:
```jsx
import { ActionButton, CrudButtons } from '../components/permissions/ActionButton';

// Botón individual
<ActionButton
    resource="student"
    action="create"
    onClick={handleCreate}
    label="Nuevo Estudiante"
    variant="primary"
/>

// Grupo de botones CRUD
<CrudButtons
    resource="student"
    onNew={handleCreate}
    onEdit={handleEdit}
    onDelete={handleDelete}
    hasSelection={selectedStudent !== null}
/>
```

**Variantes disponibles**:
- `primary` - Azul (por defecto)
- `danger` - Rojo (para eliminar)
- `success` - Verde
- `secondary` - Gris
- `outline` - Borde azul

---

## 📝 Ejemplo Completo - Actualizar Students.jsx

### Antes (sin permisos):
```jsx
import React, { useEffect, useState } from 'react';
import { crudApi } from '../api/crud';

export default function Students() {
    const [students, setStudents] = useState([]);

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Estudiantes</h2>
                <button onClick={handleCreate}>
                    + Nuevo Estudiante
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {students.map(stu => (
                    <div key={stu.StudentID}>
                        <h3>{stu.FirstName}</h3>
                        <button onClick={() => handleEdit(stu)}>Editar</button>
                        <button onClick={() => handleDelete(stu)}>Eliminar</button>
                    </div>
                ))}
            </div>
        </Layout>
    );
}
```

### Después (con permisos):
```jsx
import React, { useEffect, useState } from 'react';
import { crudApi } from '../api/crud';
import { ActionButton } from '../components/permissions/ActionButton';
import { PermissionGate } from '../components/permissions/PermissionGate';

export default function Students() {
    const [students, setStudents] = useState([]);

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Estudiantes</h2>
                
                {/* Botón solo visible si tiene permiso student.create */}
                <ActionButton
                    resource="student"
                    action="create"
                    onClick={handleCreate}
                    label="Nuevo Estudiante"
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                {students.map(stu => (
                    <div key={stu.StudentID}>
                        <h3>{stu.FirstName}</h3>
                        
                        {/* Botones con control de permisos */}
                        <div className="flex gap-2">
                            <ActionButton
                                resource="student"
                                action="update"
                                onClick={() => handleEdit(stu)}
                                label="Editar"
                                variant="secondary"
                            />
                            
                            <ActionButton
                                resource="student"
                                action="delete"
                                onClick={() => handleDelete(stu)}
                                label="Eliminar"
                                variant="danger"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
}
```

---

## 🔄 Migración de Páginas Existentes

### Pasos para actualizar cada página:

#### 1. Importar componentes necesarios
```jsx
import { ActionButton, CrudButtons } from '../components/permissions/ActionButton';
import { PermissionGate } from '../components/permissions/PermissionGate';
import { usePermissions } from '../hooks/usePermissions';
```

#### 2. Reemplazar botones por ActionButton
```jsx
// Antes
<button onClick={handleCreate}>+ Nuevo</button>

// Después
<ActionButton
    resource="invoice"
    action="create"
    onClick={handleCreate}
    label="Nuevo"
/>
```

#### 3. Envolver secciones opcionales con PermissionGate
```jsx
<PermissionGate permission="invoice.export">
    <button onClick={handleExport}>Exportar PDF</button>
</PermissionGate>
```

#### 4. Lógica condicional con usePermissions
```jsx
const { can } = usePermissions();

// En el código
if (can('student', 'update')) {
    // Permitir edición en línea
}
```

---

## 🗄️ Estructura de Base de Datos

### Tablas Involucradas

1. **`user`** - Usuarios del sistema
2. **`role`** - Roles (Admin, Teacher, Guardian, etc.)
3. **`permission`** - Permisos disponibles
4. **`user_role`** - Relación usuario-rol
5. **`role_permission`** - Relación rol-permiso

### Ejemplo de Datos

**Permisos** (`permission` table):
```sql
PermissionID | PermissionName    | Description
-------------|-------------------|---------------------------
1            | student.view      | Ver listado de estudiantes
2            | student.create    | Crear estudiantes
3            | student.update    | Editar estudiantes
4            | student.delete    | Eliminar estudiantes
5            | invoice.view      | Ver facturas
6            | invoice.export    | Exportar facturas
```

**Roles** (`role` table):
```sql
RoleID | RoleName    | Description
-------|-------------|----------------------------
1      | Admin       | Acceso total
2      | Teacher     | Profesor con acceso limitado
3      | Guardian    | Responsable con acceso a sus hijos
```

**Role_Permission** (`role_permission` table):
```sql
RolePermissionID | RoleID | PermissionID
-----------------|--------|-------------
1                | 1      | 1            -- Admin puede ver estudiantes
2                | 1      | 2            -- Admin puede crear estudiantes
3                | 2      | 1            -- Teacher puede ver estudiantes
4                | 2      | 3            -- Teacher puede editar estudiantes
```

---

## ✅ Checklist de Implementación

Para cada página del sistema:

- [ ] Importar `ActionButton` y/o `PermissionGate`
- [ ] Reemplazar botón "Nuevo" con `ActionButton`
- [ ] Reemplazar botón "Editar" con `ActionButton`
- [ ] Reemplazar botón "Eliminar" con `ActionButton`
- [ ] Envolver botones especiales (Export, Import) con `PermissionGate`
- [ ] Ocultar columnas de acción si no tiene permisos
- [ ] Probar con diferentes roles

---

## 🧪 Pruebas

### Cómo probar el sistema:

1. **Crear roles de prueba** en Supabase:
   - Admin (todos los permisos)
   - Viewer (solo *.view)
   - Editor (*.view + *.update)

2. **Asignar permisos a roles** vía página `/roles`

3. **Crear usuarios de prueba** con diferentes roles

4. **Iniciar sesión** con cada usuario y verificar:
   - ✅ Menú lateral muestra solo opciones permitidas
   - ✅ Botones aparecen/desaparecen según permisos
   - ✅ Acciones prohibidas no son visibles

---

## 📞 Soporte

Si encuentras problemas:

1. Verifica que el usuario tenga roles asignados en `user_role`
2. Verifica que el rol tenga permisos en `role_permission`
3. Revisa la consola del navegador para errores
4. Verifica que los nombres de permisos coincidan exactamente

**Formato correcto**: `student.view`, `invoice.create`
**Formato incorrecto**: `Student.View`, `invoice_create`
