# API Endpoints

Base URL examples:
- `http://localhost:3001`
- `https://nicekidscenter.onrender.com`

## Health
- `GET /health` - API health
- `GET /api/health` - alias

## Students
- `GET /api/students` - list active students (`IsActive=1`)
- `GET /api/students/:id` - get student by `StudentID`
- `POST /api/students` - create student
- `PUT /api/students/:id` - update student
- `DELETE /api/students/:id` - logical delete (sets `IsActive=0`)
- `PUT /api/students/:id/deactivate` - logical deactivate

### Student related endpoints
- `GET /api/students/:id/study-time` - study time since `EnrollmentDate`
	- Response: `{ studentId, years, months, days, totalDays, since, asOf }`
- `GET /api/students/:id/age` - age based on `BirthDate`
	- Response: `{ studentId, years, months, days, totalDays, birthDate, asOf }`
- `GET /api/students/:id/birthday-countdown` - days until next birthday
	- Response: `{ studentId, daysUntil, nextBirthday, asOf }`
- `GET /api/students/:id/guardians` - list guardians for a student

	Response fields: array of objects with `GuardianID`, `FirstName`, `LastName`, `Relationship` (from `student_guardian.Relationship`).

- `GET /api/students/:id/attendance?from=YYYY-MM-DD&to=YYYY-MM-DD` - attendance records and summary
	- Response: `{ total, present, records: [...] }`
 - `GET /api/attendance/report?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=student|class` - attendance report
 	- Response: `{ summary: [...], records: [...] }` where `summary` is either per-student objects (`StudentID, FirstName, LastName, totalDays, presentDays, absentDays, percentPresent`) or per-class objects (`GradeID, totalDays, presentDays, absentDays, percentPresent`) when `groupBy=class`.
- `GET /api/students/:id/payments` - payments list for student
- `GET /api/students/:id/payments/summary` - payments summary `{ total }`
 - `GET /api/students/:id/payments/summary` - payments summary
 	- Response: `{ totalPaid, totalDue, balance, lastPayments: [...] }` where `lastPayments` is an array of recent payments (`StudentPaymentID, PaymentDate, PaidAmount, TotalAmount, Status`).

- `GET /api/students/:id/progress-report` - student progress report (attendance + observations)
	- Query Params: optional `from=YYYY-MM-DD`, `to=YYYY-MM-DD`
	- Response: `{ StudentID, totalDays, presentDays, absentDays, percentPresent, observations: [...] }`

## Guardians
- `GET /api/guardians` - list guardians
- `GET /api/guardians/:id` - guardian detail
- `POST /api/guardians` - create guardian
- `PUT /api/guardians/:id` - update guardian
- `DELETE /api/guardians/:id` - logical delete
- `PUT /api/guardians/:id/deactivate` - logical deactivate
- `GET /api/guardians/:id/students` - list students for guardian

## Staff
- `GET /api/staff` - list staff
- `GET /api/staff/:id` - staff detail
- `POST /api/staff` - create staff
- `PUT /api/staff/:id` - update staff
- `DELETE /api/staff/:id` - logical delete
- `PUT /api/staff/:id/deactivate` - logical deactivate

## Users
- `GET /api/users` - list users
- `GET /api/users/:id` - user detail
- `POST /api/users` - create user
- `PUT /api/users/:id` - update user
- `DELETE /api/users/:id` - logical delete

## Student-Guardian relations
- `GET /api/student-guardians` - list links
- `GET /api/student-guardians/:id` - link detail
- `POST /api/student-guardians` - create link
- `PUT /api/student-guardians/:id` - update link
- `DELETE /api/student-guardians/:id` - delete link

**Relation endpoints (convenience)**
- `GET /api/guardians/:id/students` - list students linked to a guardian
	- Response fields: array with `StudentID`, `FirstName`, `LastName`, `Relationship` (from `student_guardian.Relationship`).

**Bulk import (optional)**
- `POST /api/students/import` - import CSV/JSON multipart for batch student creation (recommended validation and dry-run option).

## Attendance
- `GET /api/attendance` - list attendance
- `GET /api/attendance/:id` - detail
- `POST /api/attendance` - create
- `PUT /api/attendance/:id` - update
- `DELETE /api/attendance/:id` - delete

- `GET /api/attendance/late?date=YYYY-MM-DD&thresholdMinutes=15` - list late arrivals for a date (or for all dates when omitted). Uses `IsLate` / `LateMinutes` fields if present.

## Payments
- `GET /api/student-payments` - list student payments
- `GET /api/student-payments/:id` - payment detail
- `POST /api/student-payments` - create payment
- `PUT /api/student-payments/:id` - update payment
- `DELETE /api/student-payments/:id` - delete payment

## Notes
- Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set in server environment.

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
**Student Rules**
- `GET /api/students/:id/study-time` : study time
- `GET /api/students/1/birthday-countdown` : Birthday Countdown
- `GET /api/students/1/age` : Age of student

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

- `GET /api/activities/staff/:id` - list activities assigned to a staff/teacher by `EmpID` (filter by `EmpID`).

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