# Manual de Usuario — NiceKids Daycare Center

Bienvenido/a al sistema de gestión NiceKids para guarderías. Este manual te guía para acceder, usar los módulos principales (alumnos, tutores, asistencia, actividades, facturación, pagos, notificaciones), y resolver problemas comunes.

---

## 1. Acceso y requisitos

- Navegador actualizado (Chrome, Edge, Firefox)
- Credenciales de acceso (proporcionadas por la administración)
- APIs y Cliente corriendo localmente (solo para uso en desarrollo)

Si trabajas en modo local, asegúrate de tener:
- Node.js 18+ y npm instalados
- Variables de entorno configuradas (ver README del proyecto)

---

## 2. Puesta en marcha local (desarrolladores)

Usa 3 terminales:

1) API CRUD (datos) — puerto 3001
```bash
cd api-crud
npm run dev
```
Salud: `http://localhost:3001/health`

2) API Business (negocio) — puerto 3002
```bash
cd api-business
npm run dev
```
Salud: `http://localhost:3002/health`

3) Cliente (React/Vite) — puerto 5173
```bash
cd client
npm run dev
```
Acceso: `http://localhost:5173`

Si usas producción, consulta el despliegue en Render/Servidor y pide la URL oficial.

---

## 3. Inicio de sesión

- Abre la app y ve a la pantalla de **Login**.
- Ingresa tu **correo** y **contraseña**.
- Si olvidaste la contraseña, comunícate con soporte para restablecerla.
- Tras iniciar sesión, verás el **Dashboard** con tus accesos rápidos.

---

## 4. Módulos principales

A continuación, un resumen de cada sección (las rutas pueden variar según permisos y rol):

### Dashboard
- Resumen de actividad reciente, accesos rápidos y métricas.

### Students (Estudiantes)
- Registrar nuevos alumnos, editar datos, buscar por nombre/ID.
- Exportar listados si está disponible.

### Guardians (Tutores)
- Gestionar tutores vinculados a estudiantes.
- Actualizar teléfonos, correo y relación.

### Intake (Ingreso)
- Proceso inicial de admisión: datos básicos del estudiante y tutor.

### Attendance (Asistencia)
- Registrar entradas/salidas diarias.
- Filtrar por fecha y grupo.
- Generar **PDF** de asistencia.

### Activities (Actividades)
- Planificar actividades por aula/grupo.
- Gestionar calendario y descripción.

### Grades (Calificaciones)
- Registrar y consultar calificaciones.
- Exportar resultados si corresponde.

### Staff (Personal)
- Alta y edición de empleados.
- Datos de contacto y rol.

### Roles (Permisos)
- Administrar permisos por rol.
- Asignación/edición de permisos del sistema.

### Users (Usuarios)
- Gestionar cuentas de usuario (crear, editar, desactivar).

### Notifications (Notificaciones)
- Bandeja de notificaciones recibidas/enviadas.
- Marcar como leídas, eliminar, enviar/broadcast según rol.

### Invoices (Facturas)
- Generar facturas para **Estudiantes** o **Profesores**.
- Revisar estado (Emitida/Pendiente/Pagada/Anulada).
- Descargar **PDF** de la factura.

### Payments (Pagos)
- Registrar pagos de estudiantes (colegiaturas, actividades, etc.).
- Ver historial y estado.

### EmployeePayments (Pagos a Profesores)
- Registrar y consultar pagos al personal docente.
- Periodos, monto, método de pago y estado.

### Reports (Reportes)
- Generar informes por rango de fechas, aula, estado, etc.

### Tasks (Tareas)
- Lista de tareas pendientes/asignadas por usuario o rol.

### Profile (Perfil)
- Actualizar datos personales y foto de perfil.
- Cambiar contraseña.

---

## 5. Facturación y Pagos — Flujo típico

1. **Generar factura** en Invoices:
   - Selecciona tipo (Estudiante/Profesor) y referencia.
   - Añade conceptos (items) y montos.
   - Guarda; la factura tendrá un número asignado.

2. **Descargar PDF**:
   - Abre la factura y usa la opción **Descargar PDF**.

3. **Registrar pago** (Payments o EmployeePayments):
   - Selecciona la factura y registra el pago parcial o total.
   - El estado se actualiza a **Pagada** cuando el monto cubre el total.

---

## 6. Consejos de uso

- Usa los filtros y la búsqueda para encontrar alumnos, tutores o facturas.
- Si ves datos desactualizados, refresca la vista o vuelve a la sección.
- Exporta listados a **Excel** o **PDF** cuando el módulo lo permita.
- Mantén tus credenciales seguras y cierra sesión en equipos compartidos.

---

## 7. Solución de problemas

- **No puedes entrar**: verifica usuario/contraseña; si persiste, solicita restablecimiento.
- **Lentitud**: cierra y reabre el navegador; verifica tu conexión.
- **Datos que no cargan**: si estás en local, confirma que las APIs `3001` y `3002` están corriendo y que el cliente `5173` está activo.
- **Error de puertos**: cambia el puerto en `.env` o libera el existente.
- **Supabase**: revisa que la URL y las llaves estén bien configuradas en los `.env`.

---

## 8. Documentación relacionada

- Resumen de implementación: [DocumentacionMD/RESUMEN_IMPLEMENTACION.md](../DocumentacionMD/RESUMEN_IMPLEMENTACION.md)
- Sistema de permisos: [DocumentacionMD/GUIA_SISTEMA_PERMISOS.md](../DocumentacionMD/GUIA_SISTEMA_PERMISOS.md)
- Autenticación por cédula: [DocumentacionMD/GUIA_AUTENTICACION_CEDULA.md](../DocumentacionMD/GUIA_AUTENTICACION_CEDULA.md)
- Endpoints y detalles técnicos: revisa las carpetas `api-crud/` y `api-business/`.

---

## 9. Convertir esta guía a Word (.docx)

Si prefieres este manual en formato Word:

1. Instala **Pandoc** en Windows (con Chocolatey):
```powershell
choco install pandoc -y
```

2. Convierte el archivo:
```powershell
pandoc DocumentacionMD/GUIA_DE_USUARIO.md -o DocumentacionMD/GUIA_DE_USUARIO.docx
```

3. Abre el `.docx` resultante y ajusta estilos si lo deseas.

---

## 10. Soporte

Si tienes dudas o necesitas soporte:
- Contacta al responsable del sistema en tu institución.
- Revisa la documentación del proyecto en `DocumentacionMD/`.

¡Gracias por usar NiceKids Daycare Center! 

---

# Manual Completo (Estructurado)

## 1. Portada e información básica

- Nombre: NiceKids Daycare Center
- Versión: 1.0 (Febrero 2026)
- Autor/Institución: Equipo CodeSync — Desarrollo Web Avanzado
- Fecha: 01/02/2026
- Público objetivo: Usuarios administrativos, docentes, asistentes; equipo técnico de soporte

## 2. Introducción

- ¿Para qué sirve?: Sistema integral para gestionar alumnos, tutores, asistencia, actividades, calificaciones, notificaciones, facturas y pagos de una guardería.
- ¿A quién está dirigida la guía?: A usuarios finales del sistema (administrativos, docentes) y personal de soporte.
- Alcance del manual: Uso funcional de la interfaz web. No cubre detalles de implementación, despliegue en producción ni cambios de base de datos.
- Convenciones usadas:
   - Botones principales: Guardar, Editar, Eliminar, Descargar, Filtrar.
   - Colores: Verde (éxito), Amarillo (advertencia), Rojo (error), Azul (información).
   - Mensajes: "Operación exitosa", "Error al guardar", "Campos requeridos".
   - Iconos: Lupa (buscar), Lapiz (editar), Papelera (eliminar), Campana (notificaciones), Usuario (perfil).

## 3. Requisitos previos

- Dispositivo: PC o laptop; tablet con navegador moderno.
- Sistema operativo/navegador: Windows, macOS, Linux; Chrome/Edge/Firefox actualizados.
- Conexión: Internet estable.
- Credenciales: Usuario y contraseña emitidos por la administración.

## 4. Acceso al sistema

- URL de acceso (desarrollo): http://localhost:5173
- Inicio de sesión:
   1) Abre la URL.
   2) Ingresa correo y contraseña.
   3) Presiona "Iniciar sesión".
- Recuperación de contraseña: Contacta soporte para restablecimiento (según política institucional).
- Cierre de sesión: Usa el menú de usuario (arriba/derecha) y selecciona "Cerrar sesión".

## 5. Descripción general de la interfaz

- Pantalla principal: Panel (Dashboard) con accesos rápidos y métricas.
- Menús: Navegación a módulos (Students, Guardians, Attendance, Activities, Grades, Staff, Roles, Users, Notifications, Invoices, Payments, EmployeePayments, Reports, Tasks, Profile).
- Botones importantes: Nuevo, Guardar, Editar, Eliminar, Filtrar, Exportar, Descargar PDF.
- Iconos y significado: Campana (notificaciones), Usuario (perfil), Lupa (buscar), Lapiz (editar), Papelera (eliminar).
- Nota visual: Inserta aquí una captura etiquetada de la interfaz principal para tu versión en producción.

## 6. Funcionalidades (núcleo de la guía)

### 6.1 Registrar usuario (Users)
- Qué hace: Crea una cuenta para acceso al sistema.
- Pasos:
   1) Menú "Users" > "Nuevo".
   2) Completa nombre, correo, rol y permisos.
   3) Guarda.
- Resultado: Usuario creado y visible en el listado.
- Mensajes: Éxito al crear; error si falta algún campo requerido o si el correo ya existe.

### 6.2 Consultar información de estudiantes (Students)
- Qué hace: Busca y visualiza ficha de estudiantes.
- Pasos:
   1) Menú "Students".
   2) Usa filtros (nombre, ID, aula).
   3) Selecciona un estudiante para ver detalles.
- Resultado: Vista con datos del estudiante y sus tutores.
- Mensajes: Éxito de carga; advertencia si no hay resultados; error si falla la red.

### 6.3 Generar reportes (Reports)
- Qué hace: Crea informes por fechas, aula y estado.
- Pasos:
   1) Menú "Reports".
   2) Selecciona periodo y criterios.
   3) Genera y, si está disponible, exporta a PDF/Excel.
- Resultado: Reporte visible y descargable.
- Mensajes: Éxito de generación; error si faltan filtros obligatorios.

### 6.4 Registrar asistencia (Attendance)
- Qué hace: Marca asistencia diaria de estudiantes.
- Pasos:
   1) Menú "Attendance".
   2) Selecciona fecha y grupo.
   3) Marca entrada/salida.
   4) Guarda y, si se requiere, descarga PDF.
- Resultado: Registro de asistencia almacenado.
- Mensajes: Éxito al guardar; error si faltan datos.

### 6.5 Gestionar actividades (Activities)
- Qué hace: Planifica actividades por aula/grupo.
- Pasos:
   1) Menú "Activities".
   2) Crea/edita actividad con fecha, título y descripción.
   3) Guarda.
- Resultado: Actividad disponible en el calendario/listado.
- Mensajes: Éxito al guardar; error por campos obligatorios.

### 6.6 Facturación (Invoices)
- Qué hace: Genera facturas para Estudiantes o Profesores.
- Pasos:
   1) Menú "Invoices" > "Nueva factura".
   2) Selecciona tipo (Student/Teacher) y referencia.
   3) Añade conceptos (items) y montos.
   4) Guarda; descarga PDF si lo necesitas.
- Resultado: Factura con número asignado y estado (Issued/Pending/Paid/Canceled).
- Mensajes: Éxito de emisión; error si faltan items o referencia.

### 6.7 Pagos de estudiantes (Payments)
- Qué hace: Registra pagos asociados a facturas de estudiantes.
- Pasos:
   1) Menú "Payments".
   2) Selecciona factura y monto pagado.
   3) Guarda.
- Resultado: Estado de la factura se actualiza cuando el pago cubre el total.
- Mensajes: Éxito; advertencia si el pago es parcial; error por datos inválidos.

### 6.8 Pagos a profesores (EmployeePayments)
- Qué hace: Registra pagos al personal docente.
- Pasos:
   1) Menú "EmployeePayments".
   2) Indica periodo, monto, método y notas.
   3) Guarda.
- Resultado: Pago guardado con estado (Pending/Paid).
- Mensajes: Éxito al registrar; error si faltan campos.

### 6.9 Notificaciones (Notifications)
- Qué hace: Envía y gestiona notificaciones.
- Pasos:
   1) Menú "Notifications".
   2) Revisar recibidas/enviadas; marcar como leídas; eliminar.
   3) Enviar a usuarios o broadcast por rol.
- Resultado: Notificaciones entregadas o marcadas.
- Mensajes: Éxito; error si falta contenido o destinatarios.

### 6.10 Gestión de personal y roles (Staff, Roles)
- Qué hace: Administra empleados y permisos.
- Pasos:
   1) Menú "Staff" para altas/ediciones.
   2) Menú "Roles" para asignar permisos.
- Resultado: Personal y roles actualizados.
- Mensajes: Éxito; error si faltan campos o permisos.

### 6.11 Perfil y contraseña (Profile)
- Qué hace: Actualiza datos personales y cambia contraseña.
- Pasos:
   1) Menú "Profile".
   2) Edita datos y foto; cambia contraseña.
   3) Guarda.
- Resultado: Perfil actualizado.
- Mensajes: Éxito; error si la contraseña no cumple políticas.

## 7. Casos especiales y errores comunes

- Error de autenticación: Revisa credenciales; contacta soporte para restablecimiento.
- Datos no cargan: Verifica conexión; en local, confirma que APIs (3001 y 3002) estén corriendo.
- Puerto ocupado: Cambia puerto en `.env` o detén el proceso en conflicto.
- Falta de campos requeridos: Completa los marcados con asterisco.
- Permisos insuficientes: Solicita al administrador ajuste de rol/permisos.

## 8. Seguridad y buenas prácticas

- Contraseñas: Usa combinaciones seguras; no compartas credenciales.
- Cerrar sesión: Siempre al finalizar, sobre todo en equipos compartidos.
- Información sensible: No exportes ni compartas datos sin autorización.
- Uso responsable: Sigue las políticas internas de privacidad y acceso.

## 9. Preguntas frecuentes (FAQ)

- ¿No puedo iniciar sesión? Verifica usuario/contraseña; si persiste, pide restablecimiento.
- ¿Cómo descargo una factura? En "Invoices", abre la factura y usa "Descargar PDF".
- ¿Puedo registrar pagos parciales? Sí; el estado cambia a "Pagada" cuando el total se cubre.
- ¿Dónde cambio mi contraseña? En "Profile".
- ¿Cómo filtro estudiantes por aula? Usa los filtros en "Students".

## 10. Soporte y contacto

- Contacto: Responsable del sistema en tu institución (completar con correo oficial).
- Horario: Según política institucional.
- Reporte de fallos: Describe el problema, pasos para reproducir y adjunta capturas; envía al correo de soporte.

---

### (Opcional) Convertir esta guía a Word (.docx)

1) Instala Pandoc (Windows/Chocolatey):
```powershell
choco install pandoc -y
```
2) Convierte:
```powershell
pandoc DocumentacionMD/GUIA_DE_USUARIO.md -o DocumentacionMD/GUIA_DE_USUARIO.docx
```