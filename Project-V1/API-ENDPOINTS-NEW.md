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
# API-ENDPOINTS-NEW

This file is deprecated. All API URIs and documentation have been consolidated into `API-ENDPOINTS.md`.

Please refer to `API-ENDPOINTS.md` at the project root for the canonical list of endpoints and examples.

If you need a short list of newly added endpoints only, add them there and open a PR to include them in the main doc.
  ```



Motivación: mejora la navegación y generación de reportes (FR-2).
