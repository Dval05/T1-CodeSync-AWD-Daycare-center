# Mapeo de URIs - NiceKids Center

Base de producción: `https://nicekidscenter.onrender.com`
Servidor: Apache (observado por encabezado) con estructura de archivos expuesta parcialmente.

## 1. Frontend (Páginas HTML)
En producción las páginas están bajo el prefijo `/html/`:

- `/` → Página de inicio / login (formulario)
- `/html/welcome.html` → Pantalla de bienvenida post-login
- `/html/dashboard.html` → Panel principal
- `/html/activities.html` → Actividades
- `/html/attendance.html` → Asistencias / PDF (usa también `attendance-pdf.js` para generación)
- `/html/audit.html` → Auditoría
- `/html/change-password.html` → Cambio de contraseña
- `/html/grades.html` → Calificaciones
- `/html/guardians.html` → Responsables
- `/html/intake.html` → Admisión / Intake
- `/html/invoices.html` → Facturación
- `/html/notifications.html` → Notificaciones
- `/html/observations.html` → Observaciones
- `/html/payments.html` → Pagos
- `/html/profile.html` → Perfil usuario
- `/html/reports.html` → Reportes
- `/html/staff.html` → Personal
- `/html/students.html` → Estudiantes
- `/html/tasks.html` → Tareas
- `/html/welcome.html` → Bienvenida (listado otra vez para claridad)
- `/html/users/users-roles.html` → Roles de usuario

Archivos JS asociados (carga por etiqueta `<script>`):
- `/html/*.js` (mismo nombre que la página)
- JS global: `/js/auth.js`, `/js/dashboard.js`, `/js/dynamic-sidebar.js`, `/js/responsive.js`, `/js/topbar-notifications.js`, `/js/ui.js`
- Cliente Supabase: `/supabaseClient.js` (o `.ts` en desarrollo)

## 2. Backend (PHP Endpoints)
Actualmente accesibles (si no se restringe `php/`):

- `/php/auth/login.php` (POST login)
- `/php/auth/logout.php` (POST/GET logout)
- `/php/auth/session_status.php` (GET estado de sesión)
- `/php/users/get_profile.php` (GET perfil actual)
- `/php/users/provision_user.php` (POST crear/provisionar usuario)
- `/php/users/set_role.php` (POST asignar rol)

Archivos internos que NO deberían ser públicos directamente:
- `/php/config/supabase.php` (config)
- `/php/middleware/auth_middleware.php` (middleware)

### Recomendación de Reescritura / API REST
Aplicar reglas Rewrite para exponerlos bajo prefijo `/api/` y ocultar estructura física:

| Actual | Propuesto | Método | Descripción |
|--------|-----------|--------|-------------|
| /php/auth/login.php | /api/auth/login | POST | Iniciar sesión |
| /php/auth/logout.php | /api/auth/logout | POST | Cerrar sesión |
| /php/auth/session_status.php | /api/auth/session | GET | Estado de sesión |
| /php/users/get_profile.php | /api/users/me | GET | Perfil del usuario autenticado |
| /php/users/provision_user.php | /api/users | POST | Crear usuario |
| /php/users/set_role.php | /api/users/{id}/role | PUT | Cambiar rol usuario |

Futuras entidades (migración sugerida):
- `/api/students`, `/api/staff`, `/api/guardians`, `/api/invoices`, `/api/payments`, `/api/activities`, `/api/attendance`, `/api/grades`, `/api/tasks`, `/api/notifications`, `/api/reports`, `/api/observations`.

## 3. Consideraciones de Seguridad
- Bloquear acceso directo a `/php/config/` y `/php/middleware/` via `.htaccess` o configuración de VirtualHost.
- Forzar HTTPS (Render ya lo hace normalmente). 
- Usar tokens / sesiones seguras; revisar si las respuestas PHP devuelven JSON consistente.
- Validar CORS si se planea consumo desde un front distinto.

## 4. Internacionalización y Encoding
Se observan problemas de codificación (caracteres "Ã" en páginas) → Ajustar encabezado:
```html
<meta charset="UTF-8" />
```
Verificar que los archivos se guarden en UTF-8 sin BOM y que Apache no esté forzando otro charset.

## 5. Próximos Pasos Sugeridos
1. Implementar archivo `.htaccess` con RewriteRules para mapear `/api/*`.
2. Crear router central (un único `api.php`) para consolidar endpoints y reducir exposición de archivos individuales.
3. Unificar retorno JSON (status, data, error) en todos los endpoints.
4. Añadir control de acceso basado en roles (RBAC) en capa API.
5. Limpieza de rutas HTML duplicadas (ej. `welcome.html` listado dos veces) y conversión paulatina a una SPA si se adopta React.

## 6. Ejemplo de Rewrite (borrador Apache)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

RewriteRule ^api/auth/login$ php/auth/login.php [L]
RewriteRule ^api/auth/logout$ php/auth/logout.php [L]
RewriteRule ^api/auth/session$ php/auth/session_status.php [L]
RewriteRule ^api/users/me$ php/users/get_profile.php [L]
RewriteRule ^api/users$ php/users/provision_user.php [L]
RewriteRule ^api/users/([0-9]+)/role$ php/users/set_role.php [L]
```
(Agregar validaciones internas para método HTTP y formato de respuesta.)

---
¿Necesitas que prepare también el `.htaccess` o un stub de `api.php` centralizado? Indica y lo agrego.
