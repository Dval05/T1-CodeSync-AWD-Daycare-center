# Feature 2 — Seguridad y Acceso (RBAC)

Presentación ejecutiva del módulo de Seguridad y Acceso para slides: arquitectura, flujo de onboarding, referencia de API, integración frontend y matriz de roles.

---

## 1) Arquitectura de Seguridad

- **Modelo RBAC**: `Usuario ↔ Rol ↔ Permiso` con gestión granular de capacidades por módulo/acción.
- **Autenticación**: contraseñas hash con `bcrypt`.
- **Onboarding seguro**: contraseña temporal = Cédula, bandera `MustChangePassword = 1` para forzar actualización en el primer acceso.
- **Bloqueos de acceso**: hasta que el usuario cambie su contraseña inicial, no se habilitan módulos operativos.
- **Trazabilidad**: las acciones de asignación/revocación de roles y cambios de credenciales se pueden auditar a nivel de API.

### Flujo inicial de acceso (Onboarding)
1. **Creación**: se registra el usuario usando su Cédula (como contraseña temporal).
2. **Estado**: `MustChangePassword = 1` (true).
3. **Restricción**: el sistema obliga a cambiar credenciales en el primer login antes de permitir el uso de módulos.

---

## 2) Referencia de API (Backend)

### Autenticación y Credenciales

- **Login**
  - Endpoint: `POST /api/auth/login`
  - Descripción: valida credenciales y retorna el estado de perfil.
  - Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

  - Response:

```json
{
  "success": true,
  "user": {
    "UserID": 10,
    "Email": "user@example.com",
    "FirstName": "Juan",
    "LastName": "Pérez",
    "MustChangePassword": 1
  },
  "mustChangePassword": true
}
```

- **Cambio obligatorio de contraseña**
  - Endpoint: `POST /api/auth/change-password`
  - Descripción: actualiza la contraseña temporal por una definida por el usuario.
  - Request:

```json
{
  "userId": 10,
  "currentPassword": "initial_id_number",
  "newPassword": "MyNewSecurePassword123!"
}
```

### Gestión de Usuarios

| Método | Endpoint           | Descripción                                                        |
|-------|---------------------|--------------------------------------------------------------------|
| GET   | /api/user           | Lista completa de usuarios (activos e inactivos).                  |
| POST  | /api/user           | Crea usuario (contraseña por defecto = Cédula/ID Number).          |
| PUT   | /api/user/:id       | Actualiza metadatos (Teléfono, Dirección, Estado).                 |
| DELETE| /api/user/:id       | Elimina un usuario del sistema.                                    |

- **Ejemplo de creación**

```json
{
  "Email": "newuser@example.com",
  "Cedula": "987654321",
  "FirstName": "Maria",
  "LastName": "González",
  "Phone": "8888-7777",
  "Address": "Heredia",
  "IsActive": 1
}
```

### Administración RBAC (Roles y Permisos)

- **Relación Usuario-Rol**
  - Listar roles por usuario: `GET /api/user_role?UserID={id}`
  - Asignar rol: `POST /api/user_role`
  - Revocar rol: `DELETE /api/user_role/:id`

- **Estructura de Permisos**
  - Convención `{modulo}.{accion}` (ej. `student.view`).
  - Detalle de permiso: `GET /api/permission/:id`

```json
{
  "data": {
    "PermissionID": 5,
    "PermissionName": "student.view",
    "Module": "student",
    "Action": "view",
    "Description": "View students list"
  }
}
```

---

## 3) Implementación en Frontend (Client-Side)

- **Estado y Persistencia**
  - Carga de permisos centralizada en `AuthContext`.
  - Tras login: fetch en cascada `Usuario → Roles → Permisos`.
  - Persistencia en `localStorage` para mantener sesión entre refreshes.

- **Control de UI**
  - `usePermissions` (hook): lógica reusable para verificar capacidades.

```javascript
const { can } = usePermissions();
{can('student.create') && <AddButton />}
```

  - `PermissionGate` (wrapper): protege secciones específicas de la UI.

```javascript
<PermissionGate permission="report.export">
  <ExportTools />
</PermissionGate>
```

  - **Sidebar dinámico**: el menú de navegación se filtra en runtime cruzando `menuConfig.js` con el array de permisos activos del usuario.

---

## 4) Matriz de Roles y Alcances

| Rol      | Total Permisos | Descripción de Perfil                                           |
|----------|-----------------|------------------------------------------------------------------|
| Admin    | 52              | Control total: configuración, usuarios, auditoría.               |
| Teacher  | 10              | Gestión de asistencia, actividades y visualización de estudiantes.|
| Secretary| 15              | Administración, facturación y registros básicos.                 |
| Viewer   | 13              | Solo lectura: reportes y consultas generales.                    |
| Guardian | 6               | Acceso limitado a información del estudiante vinculado.          |

---

## 5) Diferenciadores Clave (para la venta)

- **Gobernanza granular**: permisos por módulo/acción; combos de roles ajustados al proceso.
- **Onboarding seguro**: bloqueo con `MustChangePassword` hasta que el usuario actualice credenciales.
- **Experiencia contextual**: UI se adapta automáticamente según permisos; menos errores y más productividad.
- **Escalable**: nuevas áreas del sistema solo requieren definir permisos y mapearlos a roles.
- **Auditable**: operaciones sensibles (roles/credenciales) pasan por API, permitiendo trazabilidad y cumplimiento.

---

## 6) Guion de Demo (3–5 min)

1. **Login inicial** con usuario nuevo (retorna `mustChangePassword = true`).
2. **Cambio de contraseña** en `POST /api/auth/change-password`.
3. **Asignación de rol** (p. ej., `Teacher`) vía `POST /api/user_role`.
4. **UI dinámica**: sección de exportar reportes aparece/desaparece según `report.export`.
5. **Acceso denegado controlado**: intentar acción sin permiso y mostrar respuesta/estado en UI.

---

## 7) Notas Técnicas

- **Stack**: Node.js/Express (API), `bcrypt` (hash), React/Vite (cliente).
- **Convenciones de permisos**: `{modulo}.{accion}` para consistencia y mantenibilidad.
- **Persistencia de sesión**: almacenamiento local en cliente; el backend centraliza lógica de roles/permisos.

---

## 8) Glosario breve

- **RBAC**: Control de Acceso Basado en Roles.
- **Permiso**: capacidad atómica (ej. `student.view`).
- **Rol**: conjunto de permisos (ej. `Teacher`).
- **MustChangePassword**: bandera que requiere cambio de credenciales al primer login.
