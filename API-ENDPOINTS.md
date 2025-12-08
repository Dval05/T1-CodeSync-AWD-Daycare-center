**Base URL**
- `http://localhost:3001`
- `https://nicekidscenter.onrender.com`

**Health**
- `GET /health`: estado del servidor.
- `GET /api/health`: alias bajo `/api`.

**Students**
- `GET /api/students`: lista estudiantes activos (`IsActive=1`).
- `GET /api/students/:id`: obtiene estudiante por `StudentID`.
- `POST /api/students`: crea estudiante.
- `PUT /api/students/:id`: actualiza por `StudentID`.
- `DELETE /api/students/:id`: desactiva lógico (`IsActive=0`).
- `PUT /api/students/:id/deactivate`: desactiva lógico.

**Guardians**
- `GET /api/guardians`: lista responsables activos (`IsActive=1`).
- `GET /api/guardians/:id`: obtiene responsable por `GuardianID`.
- `POST /api/guardians`: crea responsable.
- `PUT /api/guardians/:id`: actualiza por `GuardianID`.
- `DELETE /api/guardians/:id`: desactiva lógico (`IsActive=0`).
- `PUT /api/guardians/:id/deactivate`: desactiva lógico.

**Staff**
- `GET /api/staff`: lista personal activo (`IsActive=1`).
- `GET /api/staff/:id`: obtiene personal por `EmpID`.
- `POST /api/staff`: crea personal.
- `PUT /api/staff/:id`: actualiza por `EmpID`.
- `DELETE /api/staff/:id`: desactiva lógico (`IsActive=0`).
- `PUT /api/staff/:id/deactivate`: desactiva lógico.

**Access (Roles & Permissions)**
- `GET /api/access/permission`: lista permisos.
- `GET /api/access/permission/:id`: obtiene permiso por `_id` (UUID) o `PermissionID`.
- `POST /api/access/permission`: crea permiso.
- `PUT /api/access/permission/:id`: actualiza por `_id` o `PermissionID`.
- `GET /api/access/role`: lista roles activos (`IsActive=1`).
- `GET /api/access/role/:id`: obtiene rol por `_id` (UUID) o `RoleID`.
- `POST /api/access/role`: crea rol.
- `PUT /api/access/role/:id`: actualiza por `_id` o `RoleID`.
- `PUT /api/access/role/:id/deactivate`: desactiva lógicamente por `RoleID` (numérico).
- `GET /api/access/role-permission`: lista asignaciones rol-permiso.
- `POST /api/access/role-permission`: asigna permiso a rol.
- `DELETE /api/access/role-permission/:id`: elimina por `_id` (UUID) o `RoleID`.

**Notas**
- Usa `SUPABASE_URL` y `SUPABASE_SERVICE_KEY` en el entorno del servidor.
- Esquema Supabase alineado: tablas `student`, `guardian`, `employee`, `role`, `permission`, `role_permission`.
 
**Grade**
- `GET /api/grades`: lista grados activos (`IsActive=1`).
- `GET /api/grades/:id`: obtiene grado por `GradeID`.
- `POST /api/grades`: crea grado.
- `PUT /api/grades/:id`: actualiza por `GradeID`.
- `DELETE /api/grades/:id`: desactiva lógico (`IsActive=0`).

**Activity**
- `GET /api/activities`: lista actividades activas (`IsActive=1`).
- `GET /api/activities/:id`: obtiene actividad por `ActivityID`.
- `POST /api/activities`: crea actividad.
- `PUT /api/activities/:id`: actualiza por `ActivityID`.
- `DELETE /api/activities/:id`: desactiva lógico (`IsActive=0`).

**Activity Media** 
- `GET /api/activity-media`: lista media.
- `GET /api/activity-media/:id`: obtiene media por `MediaID`.
- `POST /api/activity-media`: crea media.
- `PUT /api/activity-media/:id`: actualiza por `MediaID`.
- `DELETE /api/activity-media/:id`: elimina por `MediaID`.

**Attendance** 
- `GET /api/attendance`: lista asistencia.
- `GET /api/attendance/:id`: obtiene por `AttendanceID`.
- `POST /api/attendance`: crea asistencia.
- `PUT /api/attendance/:id`: actualiza por `AttendanceID`.
- `DELETE /api/attendance/:id`: elimina por `AttendanceID`.

**Employee Tasks**
- `GET /api/employee-tasks`: lista tareas.
- `GET /api/employee-tasks/:id`: obtiene por `TaskID`.
- `POST /api/employee-tasks`: crea tarea.
- `PUT /api/employee-tasks/:id`: actualiza por `TaskID`.
- `DELETE /api/employee-tasks/:id`: elimina por `TaskID`.

**Invoices**
- `GET /api/invoices`: lista facturas.
- `GET /api/invoices/:id`: obtiene por `InvoiceID`.
- `POST /api/invoices`: crea factura.
- `PUT /api/invoices/:id`: actualiza por `InvoiceID`.
- `DELETE /api/invoices/:id`: elimina por `InvoiceID`.

**Notifications**
- `GET /api/notifications`: lista notificaciones.
- `GET /api/notifications/:id`: obtiene por `NotificationID`.
- `POST /api/notifications`: crea notificación.
- `PUT /api/notifications/:id`: actualiza por `NotificationID`.
- `DELETE /api/notifications/:id`: elimina por `NotificationID`.

**Users**
- `GET /api/users`: lista usuarios activos (`IsActive=1`).
- `GET /api/users/:id`: obtiene por `UserID`.
- `POST /api/users`: crea usuario.
- `PUT /api/users/:id`: actualiza por `UserID`.
- `DELETE /api/users/:id`: desactiva lógico (`IsActive=0`).

**User Roles**
- `GET /api/user-roles`: lista asignaciones usuario-rol.
- `GET /api/user-roles/:id`: obtiene por `UserRoleID`.
- `POST /api/user-roles`: crea asignación.
- `PUT /api/user-roles/:id`: actualiza por `UserRoleID`.
- `DELETE /api/user-roles/:id`: elimina por `UserRoleID`.

**Student-Guardian**
- `GET /api/student-guardians`: lista vínculos.
- `GET /api/student-guardians/:id`: obtiene por `StudentGuardianID`.
- `POST /api/student-guardians`: crea vínculo.
- `PUT /api/student-guardians/:id`: actualiza por `StudentGuardianID`.
- `DELETE /api/student-guardians/:id`: elimina por `StudentGuardianID`.

**Student Observations**
- `GET /api/student-observations`: lista observaciones.
- `GET /api/student-observations/:id`: obtiene por `ObservationID`.
- `POST /api/student-observations`: crea observación.
- `PUT /api/student-observations/:id`: actualiza por `ObservationID`.
- `DELETE /api/student-observations/:id`: elimina por `ObservationID`.

**Student Payments**
- `GET /api/student-payments`: lista pagos estudiante.
- `GET /api/student-payments/:id`: obtiene por `StudentPaymentID`.
- `POST /api/student-payments`: crea pago.
- `PUT /api/student-payments/:id`: actualiza por `StudentPaymentID`.
- `DELETE /api/student-payments/:id`: elimina por `StudentPaymentID`.

**Teacher Payments**
- `GET /api/teacher-payments`: lista pagos docente.
- `GET /api/teacher-payments/:id`: obtiene por `TeacherPaymentID`.
- `POST /api/teacher-payments`: crea pago.
- `PUT /api/teacher-payments/:id`: actualiza por `TeacherPaymentID`.
- `DELETE /api/teacher-payments/:id`: elimina por `TeacherPaymentID`.

**Sessions**
- `GET /api/sessions`: lista sesiones.
- `GET /api/sessions/:id`: obtiene por `SessionID`.
- `POST /api/sessions`: crea sesión.
- `PUT /api/sessions/:id`: actualiza por `SessionID`.
- `DELETE /api/sessions/:id`: elimina por `SessionID`.