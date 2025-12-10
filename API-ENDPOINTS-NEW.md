# API-ENDPOINTS-NEW

Documento: listados y ejemplos de las APIs nuevas añadidas al proyecto.

Base URL (ejemplo):
- `http://localhost:3001`
- `https://nicekidscenter.onrender.com`

---

## Resumen de APIs nuevas
Incluye:
- Cálculos de estudiante (tiempo de estudio, edad, cuenta regresiva a cumpleaños).
- Relaciones Tutor/Estudiante (GET ambos sentidos).
- Reportes de asistencia (por estudiante o por clase) y endpoint de registros por rango.
- Pagos: listado y resumen ampliado.
- Endpoint opcional sugerido: importación masiva (`POST /api/students/import`).

---

## Students - Cálculos

### GET /api/students/:id/study-time
- Descripción: calcula el tiempo de permanencia/estudio desde `EnrollmentDate` hasta hoy.
- Parámetros: `:id` StudentID en la ruta.
- Respuesta (200):
  ```json
  {
    "studentId": 123,
    "years": 1,
    "months": 2,
    "days": 10,
    "totalDays": 437,
    "since": "2024-09-01",
    "asOf": "2025-12-09"
  }
  ```
- Errores: 404 si no existe el estudiante; 400 si fecha inválida.

### GET /api/students/:id/age
- Descripción: calcula la edad basada en `BirthDate` (años/meses/días).
- Respuesta (200):
  ```json
  {
    "studentId": 123,
    "years": 6,
    "months": 3,
    "days": 5,
    "totalDays": 2330,
    "birthDate": "2019-09-04",
    "asOf": "2025-12-09"
  }
  ```

### GET /api/students/:id/birthday-countdown
- Descripción: días hasta el próximo cumpleaños y fecha del próximo cumpleaños.
- Respuesta (200):
  ```json
  {
    "studentId": 123,
    "daysUntil": 95,
    "nextBirthday": "2026-03-14",
    "asOf": "2025-12-09"
  }
  ```

---

## Relaciones Tutor <-> Estudiante

### GET /api/students/:id/guardians
- Descripción: lista los tutores vinculados a un estudiante.
- Respuesta (200): array de objetos con las claves:
  - `GuardianID`, `FirstName`, `LastName`, `Relationship` (valor tomado de `student_guardian.Relationship`).
- Ejemplo:
  ```json
  [
    { "GuardianID": 10, "FirstName": "Ana", "LastName": "Perez", "Relationship": "Mother" },
    { "GuardianID": 11, "FirstName": "Luis", "LastName": "Perez", "Relationship": "Father" }
  ]
  ```

### GET /api/guardians/:id/students
- Descripción: lista los estudiantes vinculados a un tutor.
- Respuesta (200): array con `StudentID`, `FirstName`, `LastName`, `Relationship`.
- Ejemplo:
  ```json
  [
    { "StudentID": 123, "FirstName": "Juan", "LastName": "Gomez", "Relationship": "Uncle" }
  ]
  ```

Motivación: mejora la navegación y generación de reportes (FR-2).

---

## Asistencia / Reportes

### GET /api/students/:id/attendance?from=YYYY-MM-DD&to=YYYY-MM-DD
- Descripción: devuelve registros de asistencia del estudiante en el rango y un resumen simple.
- Query Params opcionales: `from`, `to` (fechas ISO YYYY-MM-DD).
- Respuesta (200):
  ```json
  {
    "total": 20,
    "present": 18,
    "records": [
      { "AttendanceID": 1, "StudentID": 123, "Date": "2025-11-01", "CheckInTime": "08:05:00", "CheckOutTime": "15:00:00", "Status": "Present" },
      ...
    ]
  }
  ```
- Notas: la lógica considera `Status === 'Present'` (case-insensitive) o `CheckInTime != null` como presente.

### GET /api/students/:id/progress-report
- Descripción: reporta resumen de asistencia y observaciones para el estudiante en un rango opcional `from`/`to`.
- Query Params: optional `from=YYYY-MM-DD`, `to=YYYY-MM-DD`.
- Respuesta: `{ StudentID, totalDays, presentDays, absentDays, percentPresent, observations: [...] }`

### GET /api/attendance/report?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=student|class
- Descripción: reporte agregado de asistencia en un rango. `groupBy` determina el agrupamiento.
- Parámetros:
  - `from`, `to`: rango de fechas (opcionales, si se omiten se devuelve todo).
  - `groupBy`: `student` (por defecto) o `class`.
- Respuesta (200):
  ```json
  {
    "summary": [ /* array con aggregate por student o por class */ ],
    "records": [ /* registros individuales retornados por el rango */ ]
  }
  ```
- Formato `summary` cuando `groupBy=student`:
  ```json
  [{ "StudentID": 123, "FirstName": "Juan", "LastName": "Gomez", "totalDays": 20, "presentDays": 18, "absentDays": 2, "percentPresent": 90 }]
  ```
- Formato `summary` cuando `groupBy=class`:
  ```json
  [{ "GradeID": 3, "totalDays": 200, "presentDays": 180, "absentDays": 20, "percentPresent": 90 }]
  ```

Uso: necesario para generar PDFs y reportes agregados (FR-2).

### GET /api/attendance/late?date=YYYY-MM-DD&thresholdMinutes=15
- Descripción: lista llegadas tarde para una fecha (si se omite `date` devuelve registros marcados como tarde en la tabla). Usa campos `IsLate` y `LateMinutes` del esquema.


---

## Pagos

### GET /api/students/:id/payments
- Descripción: lista de pagos del estudiante (tabla `student_payment`).
- Respuesta: array de registros de pago con campos como `StudentPaymentID`, `PaymentDate`, `PaidAmount`, `TotalAmount`, `Status`, etc.

### GET /api/students/:id/payments/summary
- Descripción: resumen consolidado de pagos para el estudiante.
- Respuesta (200):
  ```json
  {
    "totalPaid": 320.00,
    "totalDue": 400.00,
    "balance": 80.00,
    "lastPayments": [
      { "StudentPaymentID": 55, "PaymentDate": "2025-11-10", "PaidAmount": 100.00, "TotalAmount": 100.00, "Status": "Paid" },
      ... up to 5
    ]
  }
  ```
- Notas: campos respetan el esquema `student_payment` (`PaidAmount`, `TotalAmount`, `PaymentDate`).

### GET /api/activities/staff/:id
- Descripción: lista actividades asignadas a un profesor/empleado (`EmpID`).
- Respuesta: array de actividades con campos `ActivityID, Name, ScheduledDate, StartTime, EndTime, GradeID, EmpID, ...`.


