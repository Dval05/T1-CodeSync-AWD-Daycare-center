## Kids – Gestión educativa (Supabase + Vite)

Este proyecto es una SPA ligera con HTML/JS (sin backend propio) y Supabase para:
- Autenticación, roles y permisos (RLS)
- CRUD de estudiantes, grados y tutores
- Personal y tareas
- Asistencia
- Pagos y facturación
- Actividades y multimedia (Storage)
- Observaciones
- Reportes (vistas SQL)
- Mensajería, notificaciones y auditoría

La navegación se hace con una pantalla de login (`index.html`) y un dashboard dinámico (`html/dashboard.html`).

### Requisitos
- Node.js 18+
- Una instancia de Supabase (URL + ANON KEY)

### Configuración
1) Instalar dependencias
```
npm install
```

2) Configurar variables públicas en `env.js`
- Copia `env.example.js` a `env.js` y coloca tus valores de Supabase (URL y anon key)

3) Crear el esquema en Supabase
- En la consola de SQL de Supabase, ejecuta en orden:
   - `supabase/schema.sql`
   - `supabase/policies.sql`

4) Semillas de permisos
- El `schema.sql` inserta permisos base (Dashboard, Usuarios y Roles, Estudiantes). Crea roles y asígnales permisos desde el módulo UI.

### Ejecutar en local
```
npm run dev
```
- Abre `http://localhost:3000` para ver el login. Tras iniciar sesión te lleva al dashboard.

### Protección de APIs con Google / Supabase
- El servidor Express protege todas las rutas bajo `/api/**` usando un middleware que acepta:
   - Tokens de sesión de Supabase (password/OAuth en Supabase), o
   - ID tokens de Google (Google Identity Services).
- Frontend:
   - `index.html` incluye un botón de Google; al autenticarse, se guarda `google_id_token` y se redirige al dashboard.
   - Usa `js/api.js` para llamar al backend: añade `Authorization: Bearer <token>` automáticamente (prefiere Google y cae a Supabase).
- Variables necesarias en backend (copia `.env.example` a `.env` o usa PowerShell):
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY` (para validar tokens de Supabase).
  - `SUPABASE_SERVICE_KEY` (para modelos backend con privilegios admin).
  - `GOOGLE_CLIENT_ID` (para validar ID tokens de Google).

#### Flujo rápido (Windows PowerShell)
1. **Configurar variables de entorno** (en la misma ventana PowerShell):
```powershell
$env:SUPABASE_URL="https://dkfissjbxaevmxcqvpai.supabase.co"
$env:SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZmlzc2pieGFldm14Y3F2cGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzQ3NjIsImV4cCI6MjA3ODY1MDc2Mn0.jvhYLRPvgkOa-Yx4So9-b3MfouLoRl9f-iHgkldxEcI"
$env:SUPABASE_SERVICE_KEY="TU_SERVICE_ROLE_KEY"
$env:GOOGLE_CLIENT_ID="132351690242-pu2s0jq83q1oodg677g5tdl4jijrn8vt.apps.googleusercontent.com"
$env:API_PORT="3001"
npm run api
```

2. **Iniciar frontend** (en otra terminal):
```powershell
npm run dev
```

3. **Login**: Abre http://localhost:3000 y entra con Supabase (email/contraseña) o Google. El token se obtiene automáticamente.

4. **Probar en consola del navegador** (DevTools → Console):
```javascript
// Ver el token actual
const { data: { session } } = await supabase.auth.getSession();
session?.access_token;

// Llamar a la API protegida
const resp = await fetch('/api/health', {
  headers: { Authorization: `Bearer ${session.access_token}` }
});
await resp.json();
```

#### Servidor API en local
```bash
npm run api
```
- Prueba sin token (debe responder 401):
```powershell
iwr -UseBasicParsing -Method GET -Uri http://localhost:3001/api/health
```
- Prueba con token (desde el navegador tras login con Google o Supabase):
```powershell
$token="PEGAR_TOKEN_AQUI"
iwr -UseBasicParsing -Headers @{Authorization="Bearer $token"} -Uri http://localhost:3001/api/health
       - `SUPABASE_URL` = URL de tu proyecto Supabase
       - `SUPABASE_ANON_KEY` = anon key pública para el cliente
       - `SUPABASE_SERVICE_ROLE_KEY` = service role key (solo del lado servidor, usada por PHP)
   4) `env.js` en producción: deja `PHP_BASE_URL` vacío (`''`) para usar misma-origin con Apache.
   5) Render expondrá el puerto `$PORT` automáticamente; Apache corre en 80 dentro del contenedor.

- Alternativa (Vercel):
   - Si solo sirves el frontend, usa proyecto estático (framework: Vite). Build `vite build`, output `dist/`.
   - Para endpoints, migra PHP a funciones serverless (Node/Edge) o usa un micro-servicio aparte (Render) y ajusta `PHP_BASE_URL` a ese dominio.

### Módulos implementados
- Autenticación con Supabase (login, logout)
- Usuarios/Roles: gestión de roles y permisos (UI). Nota: la creación/listado de usuarios de `auth.users` requiere backend/Edge Function (no se expone en cliente). Se oculta la sección de “Usuarios” en la UI; puedes asignar permisos a roles y consultar el rol del usuario actual mediante RLS.
- Estudiantes: CRUD completo (crear, editar, archivar y eliminar)
- Placeholders listos: grados, tutores, staff, tareas, asistencia, pagos, facturas, actividades, observaciones, reportes, notificaciones y auditoría

### Notas importantes
- Gestión de usuarios (crear/buscar otros usuarios) no es posible desde el cliente sin exponer la service role key. Para esto, usa:
   - Panel de Supabase para crear usuarios, o
   - Supabase Edge Functions (Node) con la service role key segura y endpoints protegidos.
- RLS: El archivo `policies.sql` define políticas base de lectura para usuarios autenticados y escrituras simples por propietario. Ajusta según tus necesidades.

### Estructura relevante
- `index.html`: Login (JS: `index.js`)
- `html/dashboard.html`: Layout con sidebar dinámico (JS: `js/dashboard.js`, `js/dynamic-sidebar.js`)
- `html/users/users-roles.html` + `html/users/users-roles.js`: Roles y permisos
- `html/students.html` + `html/students.js`: CRUD de estudiantes
- `supabase/schema.sql`, `supabase/policies.sql`: Tablas y RLS
- `supabaseClient.js`: Cliente Supabase (toma credenciales de `env.js`)
- `js/ui.js`: utilidades (toasts, helpers)

### Próximos pasos sugeridos
- Agregar Edge Functions para:
   - Alta de usuarios (admin) y listado paginado
   - Reportes agregados (asistencia/finanzas) si exceden las capacidades de vistas
- Implementar módulos pendientes usando los endpoints de Supabase y Storage
- Añadir auditoría por triggers (INSERT en `audit_logs`) por tabla

