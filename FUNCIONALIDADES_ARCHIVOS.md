# 📋 Funcionalidades Completas - NiceKids Daycare Center

Documentación detallada de la funcionalidad y propósito de cada archivo en el proyecto.

---

## 📁 Estructura General del Proyecto

```
T1-CodeSync-AWD-Daycare-center/
├── api-business/          # Microservicio de lógica de negocio
├── api-crud/              # Microservicio de gestión de datos
├── client/                # Aplicación cliente React
├── scripts/               # Scripts utilitarios
├── supabase/              # Scripts SQL de base de datos
└── DocumentacionMD/       # Documentación adicional
```

---

# 🚀 API-BUSINESS (Puerto 3002)

## Propósito General
Microservicio de **lógica de negocio** que maneja operaciones complejas como:
- Generación de invoices/facturas
- Gestión de notificaciones
- Reportes avanzados
- Pagos y finanzas
- Servicios de empleados y guardianes

---

## 📄 Archivos Principales

### `server.js`
- **Propósito**: Servidor principal Express
- **Funcionalidad**:
  - Inicializa la aplicación Express en puerto 3002
  - Configura middleware (CORS, JSON)
  - Carga rutas de negocio desde `src/routes`
  - Proporciona fallback de endpoints de desarrollo para testing
  - Fallback endpoints para notificaciones, finanzas y reportes

### `package.json`
- **Dependencias principales**:
  - `express`: Framework web
  - `dotenv`: Variables de entorno
  - `@supabase/supabase-js`: Cliente Supabase
  - `jsonwebtoken`: Autenticación JWT
  - `pdfkit`: Generación de PDFs
  - `axios`: Llamadas HTTP
  - `cors`: Control de acceso cross-origin

---

## 📂 `/src/config`

### `supabase.js`
- **Propósito**: Configuración del cliente Supabase
- **Funcionalidad**:
  - Inicializa cliente de Supabase
  - Configura URL y API keys desde variables de entorno
  - Proporciona instancia reutilizable para all servicios

---

## 📂 `/src/middleware`

### `authMiddleware.js`
- **Propósito**: Validación de tokens JWT
- **Funcionalidad**:
  - Valida tokens JWT en headers
  - Extrae datos del usuario del token
  - Verifica autenticación antes de acceder a rutas protegidas
  - Retorna 401 si no hay token válido

---

## 📂 `/src/controllers`

### `activityController.js`
- **Propósito**: Gestión de actividades
- **Funcionalidad**:
  - Obtener lista de actividades
  - Crear nuevas actividades
  - Actualizar actividades existentes
  - Eliminar actividades
  - Filtrar actividades por estudiante/clase

### `authController.js`
- **Propósito**: Autenticación de usuarios
- **Funcionalidad**:
  - Verificar credenciales de login
  - Generar tokens JWT
  - Validar sesiones activas

### `employeeController.js`
- **Propósito**: Gestión de empleados/docentes
- **Funcionalidad**:
  - Listar empleados
  - Obtener información de empleado específico
  - Gestionar datos de contratación
  - Consultar horarios y asignaciones

### `financeController.js`
- **Propósito**: Cálculos y reportes financieros
- **Funcionalidad**:
  - `getStudentBalance()`: Calcula balance de pago de estudiante
    - Suma pagos totales y pagados
    - Calcula deuda pendiente
  - `getTeacherBalance()`: Calcula balance de pagos de docente
  - Obtiene historial de transacciones
  - Genera reportes de ingresos/egresos

### `guardianController.js`
- **Propósito**: Gestión de guardianes/apoderados
- **Funcionalidad**:
  - Listar guardianes activos
  - Obtener información de guardián
  - Vinculaciones guardián-estudiante
  - Contacto de emergencia

### `invoiceController.js`
- **Propósito**: Generación y gestión de facturas
- **Funcionalidad**:
  - Generar facturas PDF
  - Listar facturas por periodo
  - Actualizar estado de facturas
  - Asociar facturas a estudiantes/docentes

### `notificationController.js`
- **Propósito**: Gestión de notificaciones
- **Funcionalidad**:
  - `getUnreadCount()`: Cuenta notificaciones no leídas
  - `getMyNotifications()`: Obtiene notificaciones del usuario
  - `markNotificationAsRead()`: Marca como leído
  - `markAllAsRead()`: Marca todas como leídas
  - `deleteNotification()`: Elimina notificación
  - `sendNotification()`: Envía nueva notificación
  - `broadcastToRole()`: Envía notificación a rol específico

### `paymentController.js`
- **Propósito**: Procesamiento de pagos y finanzas
- **Funcionalidad**:
  - Procesar pagos de estudiantes
  - Procesar pagos de empleados
  - Registrar transacciones
  - Actualizar estados de pago
  - Generar comprobantes

### `reportController.js` / `reportControllerRefactored.js`
- **Propósito**: Generación de reportes
- **Funcionalidad**:
  - Reporte de asistencia por periodo
  - Reporte financiero detallado
  - Reporte de desempeño estudiantil
  - Reporte de actividades
  - Export a PDF/Excel
  - Filtros por fecha, estudiante, clase

### `studentController.js`
- **Propósito**: Gestión de estudiantes
- **Funcionalidad**:
  - CRUD de estudiantes
  - Obtener lista de estudiantes activos
  - Búsqueda de estudiantes
  - Gestión de estado (activo/inactivo)
  - Datos de inscripción

---

## 📂 `/src/repositories`

Capa de acceso a datos que interactúa con Supabase
- Encapsula operaciones de lectura/escritura
- Proporciona abstracción de base de datos
- Maneja transacciones complejas

---

## 📂 `/src/routes`

### `index.js`
- **Propósito**: Agregador de rutas
- **Funcionalidad**:
  - Importa todas las sub-rutas
  - Monta en prefijos `/api`

### `activityRoutes.js`
- Rutas para CRUD de actividades

### `authRoutes.js`
- Rutas de autenticación y autorización

### `employeeRoutes.js`
- Rutas de gestión de empleados

### `financeRoutes.js`
- Rutas de operaciones financieras

### `guardianRoutes.js`
- Rutas de gestión de guardianes

### `notificationRoutes.js`
- Rutas de notificaciones

### `reportRoutes.js`
- Rutas de generación de reportes

### `studentRoutes.js`
- Rutas de gestión de estudiantes

---

## 📂 `/src/services`

### `AttendanceReportService.js`
- **Propósito**: Generar reportes de asistencia
- **Funcionalidad**:
  - Calcula porcentajes de asistencia
  - Genera reportes por período
  - Identifica patrones de inasistencia
  - Exporta datos en múltiples formatos

### `GuardianService.js`
- **Propósito**: Lógica de negocio para guardianes
- **Funcionalidad**:
  - Valida datos de guardián
  - Gestiona vínculos guardián-estudiante
  - Verificación de permisos
  - Notificación a guardianes

### `InvoiceService.js`
- **Propósito**: Generación de facturas
- **Funcionalidad**:
  - Crea facturas con número secuencial
  - Calcula montos totales
  - Genera PDFs con formato profesional
  - Envía por email

### `NotificationService.js`
- **Propósito**: Gestión centralizada de notificaciones
- **Funcionalidad**:
  - Crea notificaciones en BD
  - Envía notificaciones en tiempo real
  - Marca como leídas/no leídas
  - Filtra por usuario/rol
  - Gestiona preferencias de notificación

### `PaymentService.js`
- **Propósito**: Procesamiento de pagos
- **Funcionalidad**:
  - Calcula salarios de empleados
  - Procesa pagos estudiantes
  - Registra transacciones
  - Genera comprobantes de pago
  - Despacha notificaciones de pago

---

## 📂 `/src/scripts`

Scripts utilitarios para tareas administrativas

---

## 📂 `/src/utils`

Funciones auxiliares reutilizables
- Validadores
- Formateadores
- Generadores de IDs
- Cálculos comunes

---

# 📊 API-CRUD (Puerto 3001)

## Propósito General
Microservicio encargado de la **gestión de datos CRUD** (Create, Read, Update, Delete) con Supabase como base de datos

---

## 📄 Archivos Principales

### `server.js`
- **Propósito**: Servidor Express principal
- **Funcionalidad**:
  - Inicializa aplicación en puerto 3001
  - Valida variables de entorno de Supabase
  - Carga rutas CRUD desde `src/routes`
  - Health check endpoint `/health`
  - Control de errores de configuración

### `package.json`
- **Dependencias principales**:
  - `express`: Framework web
  - `@supabase/supabase-js`: Cliente Supabase
  - `bcrypt`: Hash de contraseñas
  - `cors`: Control de origen
  - `dotenv`: Variables de entorno
  - `pdfkit`: Generación de PDFs
  - `xlsx`: Export/Import Excel

### `.env` (Variables requeridas)
```
SUPABASE_URL=https://dkfissjbxaevmxcqvpai.supabase.co
SUPABASE_ANON_KEY=<clave anonima>
SUPABASE_SERVICE_ROLE_KEY=<clave servicio>
```

---

## 📂 `/src/config`

### `supabase.js`
- **Propósito**: Cliente Supabase reutilizable
- **Funcionalidad**:
  - Inicializa cliente con credenciales
  - Disponible para todos los módulos
  - Conexión a base de datos

---

## 📂 `/src/middleware`

### `authCheck.js`
- **Propósito**: Validación de autenticación
- **Funcionalidad**:
  - Verifica tokens JWT
  - Extrae usuario del token
  - Protege rutas

### `validation.js`
- **Propósito**: Validación de datos entrantes
- **Funcionalidad**:
  - Valida estructura de datos
  - Verifica tipos de datos
  - Valida datos obligatorios
  - Retorna errores descriptivos

---

## 📂 `/src/controllers`

### `genericController.js`
- **Propósito**: CRUD genérico para cualquier recurso
- **Funcionalidad**:
  - `getAll()`: Lista todos los registros con paginación/filtros
  - `getById()`: Obtiene registro específico por ID
  - `create()`: Crea nuevo registro
  - `update()`: Actualiza registro existente
  - `remove()`: Elimina registro
  - Manejo dinámico de diferentes tablas

### `userController.js`
- **Propósito**: Gestión especializada de usuarios
- **Funcionalidad**:
  - `createUser()`: Crea usuario con validación
  - `updateUser()`: Actualiza datos del usuario
  - `login()`: Autentica usuario y genera JWT
  - `changePassword()`: Cambia contraseña con validación
  - `resetPasswordToID()`: Resetea contraseña a ID de usuario
  - Hash de contraseñas con bcrypt

### `accessController.js`
- **Propósito**: Gestión de permisos y roles
- **Funcionalidad**:
  - `getRolePermissions()`: Obtiene permisos de un rol
  - Validación de acceso
  - Gestión de roles de usuario

---

## 📂 `/src/routes`

### `index.js`
- **Propósito**: Router principal que agrega todas las rutas
- **Funcionalidad**:
  - POST `/auth/login`: Login de usuario
  - POST `/auth/change-password`: Cambiar contraseña
  - POST `/auth/reset-password-to-id`: Reset de contraseña
  - POST `/user`: Crear usuario (necesita auth)
  - PUT `/user/:id`: Actualizar usuario
  - GET `/access/role/:id/permissions`: Obtener permisos del rol
  - Rutas CRUD genéricas:
    - GET `/:resource`: Lista todos
    - GET `/:resource/:id`: Obtiene por ID
    - POST `/:resource`: Crear (requiere auth)
    - PUT `/:resource/:id`: Actualizar (requiere auth)
    - DELETE `/:resource/:id`: Eliminar (requiere auth)

---

## 📂 `/src/services`

Lógica de negocio especializada para operaciones complejas

---

## 📂 `/src/utils`

Funciones auxiliares para validación y formateo de datos

---

# 💻 CLIENT (React + Vite)

## Propósito General
Aplicación frontend construida en **React 19** con **Tailwind CSS** para interfaz de usuario del sistema de guardería

---

## 📄 Archivos Principales

### `package.json`
- **Principales dependencias**:
  - `react` / `react-dom`: Framework UI
  - `vite`: Build tool (rolldown-vite)
  - `tailwindcss`: Estilos
  - `react-router-dom`: Routing
  - `@supabase/supabase-js`: Cliente Supabase
  - `axios`: Llamadas HTTP
  - `react-hook-form`: Manejo de formularios
  - `react-hot-toast`: Notificaciones
  - `jspdf` / `jspdf-autotable`: Generación de PDFs
  - `xlsx`: Export a Excel
  - `lucide-react`: Iconos
  - `date-fns`: Manejo de fechas

### `index.html`
- **Propósito**: HTML principal
- **Funcionalidad**:
  - Punto de entrada de la aplicación
  - Define div root para React

### `main.jsx`
- **Propósito**: Puntos de entrada de React
- **Funcionalidad**:
  - Monta App en el DOM
  - Importa estilos globales

### `App.jsx`
- **Propósito**: Componente raíz
- **Funcionalidad**:
  - Configura AuthProvider (autenticación)
  - Define rutas protegidas con BrowserRouter
  - Maneja pantalla de loading
  - Maneja cambio de contraseña requerido
  - Timeout por inactividad
  - Routing a todas las páginas principales

---

## 📂 `/src/pages`

Componentes de nivel página (full-page views)

### `Login.jsx`
- **Propósito**: Página de login
- **Funcionalidad**: Formulario de autenticación con cedula/password

### `Dashboard.jsx`
- **Propósito**: Panel principal
- **Funcionalidad**:
  - Resumen de datos clave
  - Widgets con métricas
  - Atajos a funciones principales
  - Vista según rol del usuario

### `Activities.jsx`
- **Propósito**: Gestión de actividades de clase
- **Funcionalidad**:
  - Listar actividades
  - Crear/editar/eliminar actividades
  - Asignar a estudiantes
  - Ver participantes

### `ActivityManager.jsx`
- **Propósito**: Administración avanzada de actividades
- **Funcionalidad**:
  - Vista detallada de actividades
  - Asignación a múltiples estudiantes
  - Seguimiento de progreso
  - Calificaciones

### `Attendance.jsx` / `AttendanceRefactored.jsx`
- **Propósito**: Registro de asistencia
- **Funcionalidad**:
  - Marcar asistencia diaria
  - Historial de asistencia
  - Generación de reportes
  - Alertas por inasistencia

### `Audit.jsx`
- **Propósito**: Registro de auditoría
- **Funcionalidad**:
  - Log de cambios en sistema
  - Quién cambió qué y cuándo
  - Acciones de usuarios
  - Filtros por fecha/usuario

### `Grades.jsx`
- **Propósito**: Gestión de calificaciones
- **Funcionalidad**:
  - Registrar calificaciones
  - Historial de desempeño
  - Reportes por período
  - Comparativa de notas

### `Guardians.jsx`
- **Propósito**: Gestión de guardianes/apoderados
- **Funcionalidad**:
  - CRUD de guardianes
  - Vinculación a estudiantes
  - Contacto de emergencia
  - Comunicación con guardianes

### `Intake.jsx`
- **Propósito**: Formulario de ingreso de estudiante
- **Funcionalidad**:
  - Registro de nuevo estudiante
  - Datos personales y médicos
  - Información de guardián
  - Historial previo

### `Students.jsx`
- **Propósito**: Gestión de estudiantes
- **Funcionalidad**:
  - Listado de estudiantes
  - CRUD de estudiantes
  - Búsqueda/filtros
  - Perfil del estudiante
  - Estado de matrícula

### `Payments.jsx`
- **Propósito**: Gestión de pagos estudiantiles
- **Funcionalidad**:
  - Historial de pagos
  - Realizar nuevo pago
  - Ver saldos pendientes
  - Generar recibos
  - Buscar por estudiante/período

### `EmployeePayments.jsx`
- **Propósito**: Gestión de pagos de empleados
- **Funcionalidad**:
  - Procesar nómina
  - Historial de pagos
  - Cálculo de salarios
  - Detalles de descuentos
  - Generación de comprobantes

### `Invoices.jsx`
- **Propósito**: Gestión de facturas
- **Funcionalidad**:
  - Generar facturas
  - Listado de facturas
  - Descargar en PDF
  - Filtros por período/estudiante
  - Datos de facturación

### `Profile.jsx`
- **Propósito**: Perfil del usuario
- **Funcionalidad**:
  - Ver datos personales
  - Cambiar contraseña
  - Actualizar información
  - Foto de perfil

### `Staff.jsx`
- **Propósito**: Gestión de personal/empleados
- **Funcionalidad**:
  - Listado de empleados
  - CRUD de empleados
  - Datos de contratación
  - Roles y permisos

### `Tasks.jsx`
- **Propósito**: Gestión de tareas
- **Funcionalidad**:
  - Crear tareas
  - Asignar a usuarios
  - Marcar como completadas
  - Timeline de progreso

### `Users.jsx`
- **Propósito**: Administración de usuarios
- **Funcionalidad**:
  - CRUD de usuarios
  - Gestión de roles
  - Permisos
  - Activación/desactivación

### `Roles.jsx`
- **Propósito**: Gestión de roles y permisos
- **Funcionalidad**:
  - Crear/editar roles
  - Asignar permisos
  - Visualizar matriz de permisos
  - Gestión granular de acceso

### `Reports.jsx`
- **Propósito**: Generación de reportes
- **Funcionalidad**:
  - Reportes de asistencia
  - Reportes financieros
  - Reportes de desempeño
  - Export a PDF/Excel
  - Filtros avanzados

### `Notifications.jsx`
- **Propósito**: Centro de notificaciones
- **Funcionalidad**:
  - Listar notificaciones
  - Marcar como leídas
  - Eliminar notificaciones
  - Filtros por tipo/periodo

---

## 📂 `/src/api`

Módulos de llamadas a APIs

### `business.js`
- **Propósito**: Cliente HTTP para API Business
- **Funcionalidad**:
  - Métodos para operaciones de negocio
  - Notificaciones
  - Reportes
  - Finanzas
  - Invoices
  - Manejo de errores
  - Interceptores de autenticación

### Otros módulos de API
- Configuración de endpoints
- Interceptores
- Manejo de errores centralizado

---

## 📂 `/src/components`

Componentes reutilizables

### `/attendance`
- Componentes específicos de asistencia
- Tabla de asistencia
- Formularios de registro

### `/auth`
- `ChangePasswordModal.jsx`: Modal para cambio de contraseña
- Componentes de autenticación
- Validadores de formulario

### `/common`
- Componentes genéricos reutilizables
- Headers, footers
- Botones comunes
- Spinners/loaders

### `/layout`
- `Sidebar.jsx`: Navegación lateral
- `Header.jsx`: Encabezado
- Layout wrappers
- Tema y responsivo

### `/modals`
- Modales de confirmación
- Formularios en modales
- Diálogos de alerta

### `/notifications`
- Componentes de notificaciones
- Campana de notificaciones
- Listado de notificaciones
- Marcar como leído

### `/permissions`
- Vista de matriz de permisos
- Selector de permisos
- Validación de permisos

---

## 📂 `/src/context`

Context API para estado global

### `AuthContext.jsx`
- **Propósito**: Gestión de autenticación global
- **Funcionalidad**:
  - Estado de usuario autenticado
  - Token JWT
  - Datos del perfil
  - Rol y permisos
  - Logout
  - Cambio de contraseña requerido
  - Timeout por inactividad

---

## 📂 `/src/hooks`

Custom hooks React

### `useAttendance.js`
- Lógica de asistencia reutilizable
- Obtener/actualizar asistencia
- Validaciones

### `useAttendanceReport.js`
- Generación de reportes de asistencia
- Cálculos de porcentajes
- Filtros

### `useGrades.js`
- Lógica de calificaciones
- CRUD de notas
- Promedios

### `useInactivityTimeout.js`
- Detecta inactividad
- Logout automático tras timeout
- Configurable

### `useIsAdmin.js`
- Verificar si usuario es administrador
- Rendirizacion basada en permisos

### `useNotifications.js`
- Obtener notificaciones en tiempo real
- Marcar como leídas
- Contar no leídas
- Polling o WebSocket

### `usePermissions.js`
- Verificar permisos del usuario
- Mostrar/ocultar componentes basado en permisos
- Validación granular

---

## 📂 `/src/utils`

Funciones utilitarias

### `menuUtils.js`
- **Propósito**: Configuración del menú
- **Funcionalidad**:
  - Items del menú según rol
  - Visibilidad de opciones
  - Iconos y rutas

---

## 📂 `/src/config`

Configuración centralizada

- URLs base de APIs
- Variables de Supabase
- Constantes de aplicación
- Timeouts y límites

---

## 📄 Estilos

### `index.css`
- **Propósito**: Estilos globales
- Reseteos CSS
- Variables de colores
- Tipografía

### `App.css`
- Estilos específicos de App
- Animaciones
- Responsive design

### `tailwind.config.js`
- **Propósito**: Configuración de Tailwind
- Paleta de colores
- Extensiones personalizadas
- Plugins

### `postcss.config.js`
- **Propósito**: Configuración de PostCSS
- Tailwind CSS processing
- Autoprefixer

---

## 📄 Configuración

### `vite.config.js`
- **Propósito**: Configuración de Vite/Rolldown
- Plugin React
- Port development
- Build output
- Aliases

### `eslint.config.js`
- **Propósito**: Reglas de linting
- Reglas React
- Reglas React Hooks
- Reglas de refresh

---

# 📜 Scripts Utilitarios

## `/scripts`

### `strip-code-comments.mjs`
- **Propósito**: Remover comentarios de código
- **Funcionalidad**:
  - Limpia código fuente
  - Reduce tamaño
  - Puede usarse como preprocesador
  - Ejecutado con: `npm run strip:comments`

---

# 🗄️ Supabase (Base de Datos)

## SQL Scripts en `/supabase`

### `schema.sql`
- **Propósito**: Estructura completa de base de datos
- **Contiene**:
  - Definición de todas las tablas
  - Relaciones (foreign keys)
  - Índices
  - Tipos de datos
  - Constraints

### `policies.sql`
- **Propósito**: Row Level Security (RLS)
- **Funcionalidad**:
  - Control de acceso a nivel de fila
  - Restricciones por usuario/rol
  - Filtros de datos
  - Políticas de lectura/escritura

### `initialize_permissions.sql`
- **Propósito**: Carga inicial de roles y permisos
- **Funcionalidad**:
  - Roles: Admin, Teacher, Parent, Staff
  - Permisos iniciales
  - Asignaciones por defecto

### `add_user_fields.sql`
- **Propósito**: Migración para agregar campos a tabla users
- **Cambios**: Nuevas columnas necesarias

### `add_profile_photo_column.sql` / `add_profile_photo_simple.sql`
- **Propósito**: Agregar soporte de fotos de perfil
- **Funcionalidad**:
  - Columna para URL de foto
  - Versión simple vs completa con triggers

### `update_user_password.sql`
- **Propósito**: Script para actualizar contraseña de usuario
- **Funcionalidad**: Update de contraseña con hash

---

# 📚 Documentación Adicional en `/DocumentacionMD`

### `API_DOCUMENTATION_BY_SPRINT.md`
- Documentación de endpoints por sprint
- Cambios incrementales
- Versionado de APIs

### `FEATURE_1_Asistencia.md`
- Documentación del módulo de asistencia
- Flujo de proceso
- Casos de uso

### `FEATURE_2_Seguridad_y_Acceso.md`
- Documentación de autenticación
- Seguridad
- Control de acceso

### `GUIA_AUTENTICACION_CEDULA.md`
- Guía de autenticación por cédula
- Flujo de login
- Validación de identidad

### `GUIA_DE_USUARIO.md`
- Manual para usuarios finales
- Pasos de uso
- Pantallas principales

### `GUIA_DEPURACION_LOGIN.md`
- Troubleshooting de login
- Errores comunes
- Soluciones

### `GUIA_SISTEMA_PERMISOS.md`
- Documentación de sistema de permisos
- Roles disponibles
- Matriz de permisos

### `SISTEMA_CONTRASEÑAS.md`
- Política de contraseñas
- Validación
- Requisitos de seguridad

### `REFACTORING_GUIDE.md`
- Guía de cambios estructurales
- Migraciones de código
- Mejoras realizadas

### `RESUMEN_IMPLEMENTACION.md`
- Resumen ejecutivo
- Características implementadas
- Status del proyecto

---

# 📦 Archivos Raíz

### `package.json` (Raíz)
- **Propósito**: Metadata del proyecto
- **Contiene**:
  - Nombre: NiceKids Daycare
  - Dependencias principales (bcrypt)
  - Script: `strip:comments`

### `README.md`
- **Propósito**: Guía de instalación y configuración
- **Contiene**:
  - Requisitos previos
  - Pasos de instalación
  - Variables de entorno
  - Comandos para iniciar

### `render.yaml`
- **Propósito**: Configuración para deploy en Render
- **Funcionalidad**:
  - Especificaciones de servicios
  - Variables de entorno para producción
  - Build commands
  - Port mappings

### `temp_invoice.json`
- **Propósito**: Datos temporales de facturas
- **Uso**: Testing/desarrollo local

### `temp_payment.json`
- **Propósito**: Datos temporales de pagos
- **Uso**: Testing/desarrollo local

---

# 🔄 Flujo de Datos General

```
Client (React)
    ↓ HTTP (axios)
    ├→ API CRUD (3001) - Operaciones CRUD
    │   ├→ Supabase (BD)
    │   └→ Respuestas genéricas
    │
    └→ API Business (3002) - Lógica compleja
        ├→ API CRUD (para datos)
        ├→ Supabase (consultas)
        └→ Servicios especializados
```

---

# 🔐 Seguridad

- **Autenticación**: JWT tokens
- **Contraseñas**: Bcrypt hash
- **Base de datos**: Supabase RLS (Row Level Security)
- **CORS**: Configurado en APIs
- **Middleware**: Validación en requests

---

# 🚀 Despliegue

- **Plataforma**: Render
- **Configuración**: `render.yaml`
- **Base de datos**: Supabase cloud
- **Frontend hosting**: Render static site
- **Microservicios**: Separados en 3 servicios

---

Última actualización: Febrero 2026
