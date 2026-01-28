# Feature 1: Asistencia (Attendance)

> Documento resumido, listo para diapositivas. Enfocado en objetivos, alcance, datos, permisos, UI, endpoints y métricas.

---

## Resumen
- Gestiona la asistencia diaria de estudiantes: Presente/Ausente y Retardo.
- Guarda registros en lote por fecha y estudiante.
- Genera reportes con estadísticas, tablas, PDF y exportación a Excel.
- Protegido por permisos y políticas RLS en Supabase.

## Objetivos
- Registrar asistencia de forma rápida y consistente.
- Visualizar estadísticas de asistencia por rango de fechas, curso y estudiante.
- Exportar reportes en formatos PDF y Excel para auditorías.

## Alcance Funcional
- Marcar `Presente`/`Ausente` por estudiante y fecha.
- Marcar `Retardo` solo si el estado es `Presente`.
- Guardar asistencia en lote.
- Filtros en reportes: fechas, curso y estudiante.
- Estadísticas: totales, presentes, ausentes, retardos y porcentajes.
- Exportación: PDF y Excel.
- Visualización de gráficas.

## Roles y Permisos
- Permisos en base de datos:
  - `attendance.view` – Ver asistencia.
  - `attendance.create` – Registrar asistencia.
  - `attendance.update` – Modificar asistencia.
  - `attendance.delete` – Eliminar asistencia.
- Menú de la app: la ruta `Asistencia` requiere `attendance.view`.
- Políticas RLS (Supabase):
  - Lectura: `read_attendance_view` usando módulo `Asistencia` acción `view`.
  - Escritura: `ins_attendance_edit`, `upd_attendance_edit`, `del_attendance_edit` con acción `edit`.

## Modelo de Datos (Supabase)
Tabla: `public.attendance`
- `AttendanceID` (PK, int, identity)
- `StudentID` (int, FK → `student.StudentID`, ON DELETE CASCADE)
- `Date` (date, NOT NULL)
- `CheckInTime` (time, opcional)
- `CheckOutTime` (time, opcional)
- `Status` (enum `attendance_status`, default `Present`)
- `IsLate` (smallint, default 0)
- `LateMinutes` (int, default 0)
- `Notes` (text)
- `CheckedInBy` (int, FK → `employee.EmpID`, ON DELETE SET NULL)
- `CheckedOutBy` (int, FK → `employee.EmpID`, ON DELETE SET NULL)
- `CreatedAt` (timestamp, default now())
- `UpdatedAt` (timestamp)

## UI/UX (Página Asistencia)
- Secciones (tabs):
  1) Registrar Asistencia
  2) Reportes
  3) Gráficas
- Registrar:
  - Selección de fecha.
  - Lista de estudiantes con botón de estado `Presente/Ausente`.
  - Checkbox de `Retardo` habilitado solo si el estudiante está `Presente`.
  - Botón “Guardar Asistencia” (crea registros en lote).
- Reportes:
  - Filtros: fecha desde/hasta, curso, estudiante.
  - Dashboard con tarjetas: Total, Presentes, Ausentes, Retardos (y porcentaje).
  - Tabla de detalle: fecha, estudiante, estado, retardo.
  - Acciones: “Generar PDF” y “Exportar Excel”.
- Gráficas:
  - Usa los mismos filtros y muestra componentes de `Charts` con los datos.

## Endpoints CRUD (API CRUD)
- Listar asistencia
  - `GET /api/attendance`
  - Respuesta: arreglo de registros mínimos.
- Obtener por ID
  - `GET /api/attendance/:id`
  - Respuesta: registro completo con campos de tiempos y notas.
- Crear registro
  - `POST /api/attendance`
  - Body ejemplo: `{ StudentID, Date, Status, IsLate, LateMinutes?, Notes?, CheckedInBy? }`
- Actualizar registro
  - `PUT /api/attendance/:id`
  - Body ejemplo: `{ Status, Notes }`
- Eliminar registro
  - `DELETE /api/attendance/:id`

## Endpoints de Reportes (API BUSINESS)
- Reporte por rango de fechas (JSON)
  - `GET /api/reports/attendance?from=YYYY-MM-DD&to=YYYY-MM-DD&studentId?=&gradeId?=`
  - Respuesta: `{ stats: { total, present, absent, late }, records: [...] }` con `student{ FirstName, LastName, GradeID }`.
- Reporte PDF
  - `GET /api/reports/attendance?from=...&to=...&format=pdf&studentId?=&gradeId?=`
  - Respuesta: archivo PDF (descarga).

## Métricas y KPIs
- Porcentaje de asistencia: `present / total * 100`.
- Retardos: conteo de registros con `IsLate = 1`.
- Tablero muestra valores y porcentajes redondeados a una decima.

## Validaciones y Reglas
- `Retardo` está deshabilitado si el estado no es `Presente`.
- Inicialización: todos los estudiantes se marcan `Presente` y `IsLate = 0` por defecto.
- Guardado en lote: crea un registro por estudiante para la fecha seleccionada.
- Manejo de errores con toasts en la UI.
- Exportación Excel requiere dependencia `xlsx` instalada.

## Integración Técnica
- Frontend (React):
  - Página `Attendance.jsx` (tabs, filtros, tabla, acciones PDF/Excel).
  - Hooks: `useAttendance` y `useAttendanceReport` para estado y llamadas.
  - Componentes: `AttendanceTable`, `Charts`.
- APIs:
  - `crudApi` para CRUD de asistencia.
  - `businessApi` para reportes y PDFs.
- Backend (Supabase + Node en business API):
  - Controlador `getAttendanceReport` calcula estadísticas y retorna registros.
  - Políticas RLS garantizan acceso según permisos.

## Flujo de Usuario (Demo)
1) Ingresar a `Asistencia` desde el menú.
2) En “Registrar Asistencia”: escoger fecha, marcar estados y retardos, “Guardar”.
3) En “Reportes”: setear filtros y “Buscar” para ver dashboard y tabla.
4) Exportar: “Generar PDF” o “Exportar Excel”.
5) En “Gráficas”: “Buscar” y visualizar tendencias.

## Riesgos y Consideraciones
- Duplicidad de registros si se guarda múltiples veces para la misma fecha sin validaciones adicionales.
- Dependencia de permisos: sin `attendance.view` no aparece la sección.
- Rango de fechas grande puede impactar rendimiento en reportes.

## Próximos Pasos (Opcional)
- Evitar duplicados por `StudentID + Date` (unique constraint y/o lógica en API).
- Añadir filtros por hora de entrada/salida y minutos de retardo.
- Agregar edición y eliminación desde la UI de `Reportes`.
- Añadir gráficos por curso/estudiante (barras, líneas) y comparativas.
