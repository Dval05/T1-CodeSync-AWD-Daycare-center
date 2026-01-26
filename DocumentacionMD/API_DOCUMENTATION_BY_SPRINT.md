# API Documentation - Nice Kids Center
## Organized by Sprint

**Base URL:** https://nicekidscenter.onrender.com

---

## 📋 Important Notes on Data Fields

### Required Fields and Validations

#### **Students (Estudiantes)**
- **Required Fields:** `FirstName`, `LastName`, `BirthDate`
- **Document Number:** `DocumentNumber` - Cédula ecuatoriana de 10 dígitos (Ej: "1234567890")
- **Gender:** Enum values: `'Male'`, `'Female'`, `'Other'`
- **Phone Numbers:** Formato ecuatoriano 10 dígitos (Ej: "0991234567")
- **Important Fields:**
  - `MedicalInfo` - Información médica crítica (alergias, condiciones)
  - `EmergencyContact` & `EmergencyPhone` - Contacto de emergencia obligatorio
  - `EnrollmentDate` - Fecha de inscripción
  - `IsRecurrent` - Si es estudiante recurrente (1) o temporal (0)

#### **Guardians (Responsables/Tutores)**
- **Required Fields:** `FirstName`, `LastName`, `Relationship`
- **Document Number:** `DocumentNumber` - Cédula ecuatoriana de 10 dígitos
- **Relationship:** Tipo de relación (Ej: "Mother", "Father", "Uncle", "Grandmother")
- **Phone Numbers:** Formato ecuatoriano 10 dígitos
- **Authorization Fields:**
  - `IsEmergencyContact` - Si puede ser contactado en emergencias (0/1)
  - `IsAuthorizedPickup` - Si está autorizado para recoger al estudiante (0/1)
- **Contact Info:**
  - `WorkPhone` - Teléfono del trabajo (incluir código de área)
  - `Occupation` - Ocupación/profesión

#### **Staff/Employees (Personal)**
- **Required Fields:** `FirstName`, `LastName`, `Position`
- **Document Number:** `DocumentNumber` - Cédula ecuatoriana de 10 dígitos
- **Phone Numbers:** Formato ecuatoriano 10 dígitos
- **Financial Fields:**
  - `Salary` - Salario mensual (numeric 10,2)
  - `BankAccount` - Número de cuenta bancaria
- **Emergency Contact:** `EmergencyContact` & `EmergencyPhone` obligatorios
- **Important Dates:**
  - `HireDate` - Fecha de contratación
  - `TerminationDate` - Fecha de terminación (null si activo)

#### **Attendance (Asistencia)**
- **Required Fields:** `StudentID`, `Date`, `Status`
- **Status Values:** `'Present'`, `'Absent'`, `'Excused'`, `'Tardy'`
- **Late Tracking:**
  - `IsLate` - Si llegó tarde (0/1)
  - `LateMinutes` - Minutos de retraso
- **Check Times:**
  - `CheckInTime` - Hora de entrada (formato: "HH:MM:SS")
  - `CheckOutTime` - Hora de salida
- **Responsible:**
  - `CheckedInBy` - EmpID del empleado que registró entrada
  - `CheckedOutBy` - EmpID del empleado que registró salida

#### **Student Payments (Pagos de Estudiantes)**
- **Required Fields:** `StudentID`, `TotalAmount`, `DueDate`, `Status`
- **Service Types:** `'Monthly'`, `'Daily'`, `'Hourly'`, `'Other'`
- **Payment Methods:** `'Cash'`, `'Card'`, `'Transfer'`
- **Status Values:** `'Pending'`, `'Partial'`, `'Paid'`, `'Canceled'`
- **Important Fields:**
  - `MonthlyFee` - Cuota mensual fija
  - `DailyFee` - Cuota por día
  - `RatePerHour` & `Hours` - Para servicios por hora
  - `BalanceRemaining` - Saldo pendiente
  - `InvoiceNumber` - Número de factura asociada
  - `TransactionReference` - Referencia de transacción bancaria

#### **Teacher Payments (Pagos de Profesores)**
- **Required Fields:** `EmpID`, `PaymentPeriod`, `PeriodStartDate`, `PeriodEndDate`, `BaseSalary`, `TotalAmount`, `PaymentDate`, `PaymentMethod`, `Status`
- **Payment Methods:** `'Transfer'`, `'Cash'`, `'Check'`
- **Status Values:** `'Pending'`, `'Paid'`, `'Canceled'`
- **Salary Components:**
  - `BaseSalary` - Salario base
  - `Bonuses` - Bonificaciones
  - `Overtime` - Horas extras
  - `Deductions` - Deducciones
  - `TotalAmount` - Total a pagar

### 🔒 Data Validation Rules
1. **Cédula Ecuatoriana:** Debe tener exactamente 10 dígitos numéricos
2. **Phone Numbers:** Formato ecuatoriano, 10 dígitos comenzando con 0
3. **Emails:** Formato válido de email
4. **Dates:** Formato ISO 8601 (YYYY-MM-DD)
5. **Times:** Formato 24 horas (HH:MM:SS)
6. **Numeric Fields:** Usar formato decimal para montos (Ej: 150.00)
7. **IsActive Fields:** Valores 0 o 1 (soft delete)

---

## Sprint 1 - Basic CRUD Operations

### Health Check
**Check API status**
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/health
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
{
  "status": "API CRUD OK",
  "timestamp": "2026-01-23T10:30:00.000Z",
  "env_check": "OK"
}
```

---

### Students - Basic CRUD

#### List all active students
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/students
- **API:** CRUD
- **Request:** N/A (requires authentication)
- **Response:**
```json
[
  {
    "StudentID": 1,
    "FirstName": "Juan",
    "LastName": "Pérez",
    "BirthDate": "2018-05-15",
    "GradeID": 2,
    "IsActive": 1
  }
]
```

#### Get student by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/students/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/students/1)
- **Response:**
```json
{
  "StudentID": 1,
  "FirstName": "Juan",
  "LastName": "Pérez",
  "BirthDate": "2018-05-15",
  "Gender": "Male",
  "DocumentNumber": "1234567890",
  "Address": "Av. Principal 123, Quito",
  "Email": "juan.perez@parent.com",
  "PhoneNumber": "0991234567",
  "GradeID": 2,
  "ProfilePicture": null,
  "MedicalInfo": "Ninguna",
  "EmergencyContact": "Ana Pérez",
  "EmergencyPhone": "0987654321",
  "IsActive": 1,
  "IsRecurrent": 1,
  "EnrollmentDate": "2024-01-15",
  "WithdrawalDate": null,
  "CreatedAt": "2024-01-15T10:00:00.000Z",
  "UpdatedAt": "2026-01-20T15:30:00.000Z"
}
```

#### Create student
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/students
- **API:** CRUD
- **Request:**
```json
{
  "FirstName": "María",
  "LastName": "González",
  "BirthDate": "2019-03-20",
  "Gender": "Female",
  "DocumentNumber": "1234567890",
  "Address": "Av. Principal 123, Quito",
  "Email": "maria.gonzalez@parent.com",
  "PhoneNumber": "0991234567",
  "GradeID": 1,
  "ProfilePicture": null,
  "MedicalInfo": "Ninguna alergia conocida",
  "EmergencyContact": "Ana González",
  "EmergencyPhone": "0987654321",
  "IsActive": 1,
  "IsRecurrent": 1,
  "EnrollmentDate": "2026-01-15"
}
```
- **Response:**
```json
{
  "StudentID": 45,
  "FirstName": "María",
  "LastName": "González",
  "IsActive": 1
}
```

#### Update student
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/students/:id
- **API:** CRUD
- **Request:**
```json
{
  "FirstName": "María José",
  "GradeID": 2
}
```
- **Response:**
```json
{
  "StudentID": 45,
  "FirstName": "María José",
  "GradeID": 2
}
```

#### Delete student (logical)
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/students/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/students/45)
- **Response:**
```json
{
  "message": "Student deactivated successfully",
  "StudentID": 45
}
```

---

### Guardians - Basic CRUD

#### List all guardians
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/guardians
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "GuardianID": 1,
    "FirstName": "Ana",
    "LastName": "Pérez",
    "Email": "ana.perez@email.com",
    "Phone": "0991234567",
    "IsActive": 1
  }
]
```

#### Get guardian by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/guardians/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/guardians/1)
- **Response:**
```json
{
  "GuardianID": 1,
  "FirstName": "Ana",
  "LastName": "Pérez",
  "DocumentNumber": "1234567890",
  "Relationship": "Mother",
  "PhoneNumber": "0991234567",
  "Email": "ana.perez@email.com",
  "Address": "Av. Principal 123, Quito",
  "Occupation": "Contadora",
  "WorkPhone": "0223456789",
  "UserID": 5,
  "IsActive": 1,
  "IsEmergencyContact": 1,
  "IsAuthorizedPickup": 1,
  "CreatedAt": "2024-01-10T09:00:00.000Z",
  "UpdatedAt": "2026-01-15T14:00:00.000Z"
}
```

#### Create guardian
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/guardians
- **API:** CRUD
- **Request:**
```json
{
  "FirstName": "Luis",
  "LastName": "García",
  "DocumentNumber": "0987654321",
  "Relationship": "Father",
  "PhoneNumber": "0987654321",
  "Email": "luis.garcia@email.com",
  "Address": "Calle Secundaria 456, Quito",
  "Occupation": "Ingeniero",
  "WorkPhone": "0223456789",
  "IsActive": 1,
  "IsEmergencyContact": 1,
  "IsAuthorizedPickup": 1
}
```
- **Response:**
```json
{
  "GuardianID": 25,
  "FirstName": "Luis",
  "LastName": "García",
  "IsActive": 1
}
```

#### Update guardian
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/guardians/:id
- **API:** CRUD
- **Request:**
```json
{
  "Phone": "0999999999",
  "Address": "Nueva Dirección 456"
}
```
- **Response:**
```json
{
  "GuardianID": 25,
  "Phone": "0999999999",
  "Address": "Nueva Dirección 456"
}
```

#### Delete guardian (logical)
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/guardians/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/guardians/25)
- **Response:**
```json
{
  "message": "Guardian deactivated successfully",
  "GuardianID": 25
}
```

---

### Staff - Basic CRUD

#### List all staff
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/staff
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "EmpID": 1,
    "FirstName": "Carlos",
    "LastName": "Rodríguez",
    "Position": "Teacher",
    "Email": "carlos.rodriguez@nicekids.com",
    "IsActive": 1
  }
]
```

#### Get staff by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/staff/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/staff/1)
- **Response:**
```json
{
  "EmpID": 1,
  "FirstName": "Carlos",
  "LastName": "Rodríguez",
  "DocumentNumber": "1798765432",
  "Position": "Teacher",
  "Email": "carlos.rodriguez@nicekids.com",
  "PhoneNumber": "0991111111",
  "Address": "Calle Los Rosales 567, Quito",
  "HireDate": "2023-01-15",
  "TerminationDate": null,
  "Salary": 1200.00,
  "BankAccount": "9876543210987654",
  "EmergencyContact": "María Rodríguez",
  "EmergencyPhone": "0987777777",
  "Qualifications": "Licenciado en Educación Infantil, 5 años de experiencia",
  "ProfilePicture": null,
  "IsActive": 1,
  "UserID": 3,
  "CreatedAt": "2023-01-15T08:00:00.000Z",
  "UpdatedAt": "2025-12-10T10:30:00.000Z"
}
```

#### Create staff
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/staff
- **API:** CRUD
- **Request:**
```json
{
  "FirstName": "Laura",
  "LastName": "Martínez",
  "DocumentNumber": "1723456789",
  "Position": "Assistant",
  "Email": "laura.martinez@nicekids.com",
  "PhoneNumber": "0992222222",
  "Address": "Av. 6 de Diciembre 789, Quito",
  "HireDate": "2026-01-20",
  "Salary": 800.00,
  "BankAccount": "1234567890123456",
  "EmergencyContact": "Pedro Martínez",
  "EmergencyPhone": "0991111111",
  "Qualifications": "Licenciada en Educación Inicial",
  "ProfilePicture": null,
  "IsActive": 1
}
```
- **Response:**
```json
{
  "EmpID": 15,
  "FirstName": "Laura",
  "LastName": "Martínez",
  "IsActive": 1
}
```

#### Update staff
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/staff/:id
- **API:** CRUD
- **Request:**
```json
{
  "Position": "Senior Teacher",
  "Phone": "0993333333"
}
```
- **Response:**
```json
{
  "EmpID": 1,
  "Position": "Senior Teacher",
  "Phone": "0993333333"
}
```

#### Delete staff (logical)
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/staff/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/staff/15)
- **Response:**
```json
{
  "message": "Staff member deactivated successfully",
  "EmpID": 15
}
```

---

### Grades - Basic CRUD

#### List all grades
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/grades
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "GradeID": 1,
    "GradeName": "Prekinder",
    "Capacity": 15,
    "IsActive": 1
  },
  {
    "GradeID": 2,
    "GradeName": "Kinder",
    "Capacity": 20,
    "IsActive": 1
  }
]
```

#### Get grade by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/grades/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/grades/1)
- **Response:**
```json
{
  "GradeID": 1,
  "GradeName": "Prekinder",
  "Capacity": 15,
  "TeacherID": 1,
  "IsActive": 1
}
```

#### Create grade
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/grades
- **API:** CRUD
- **Request:**
```json
{
  "GradeName": "First Grade",
  "Capacity": 25,
  "TeacherID": 2
}
```
- **Response:**
```json
{
  "GradeID": 5,
  "GradeName": "First Grade",
  "Capacity": 25
}
```

#### Update grade
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/grades/:id
- **API:** CRUD
- **Request:**
```json
{
  "Capacity": 18,
  "TeacherID": 3
}
```
- **Response:**
```json
{
  "GradeID": 1,
  "Capacity": 18,
  "TeacherID": 3
}
```

#### Delete grade (logical)
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/grades/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/grades/5)
- **Response:**
```json
{
  "message": "Grade deactivated successfully",
  "GradeID": 5
}
```

---

### Attendance - Basic CRUD

#### List all attendance records
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/attendance
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "AttendanceID": 1,
    "StudentID": 1,
    "Date": "2026-01-23",
    "Status": "Present",
    "IsLate": 0
  }
]
```

#### Get attendance by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/attendance/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/attendance/1)
- **Response:**
```json
{
  "AttendanceID": 1,
  "StudentID": 1,
  "Date": "2026-01-23",
  "CheckInTime": "08:00:00",
  "CheckOutTime": "16:00:00",
  "Status": "Present",
  "IsLate": 0,
  "LateMinutes": 0,
  "Notes": null,
  "CheckedInBy": 1,
  "CheckedOutBy": 1,
  "CreatedAt": "2026-01-23T08:00:00.000Z",
  "UpdatedAt": "2026-01-23T16:00:00.000Z"
}
```

#### Create attendance record
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/attendance
- **API:** CRUD
- **Request:**
```json
{
  "StudentID": 1,
  "Date": "2026-01-23",
  "CheckInTime": "08:15:00",
  "CheckOutTime": null,
  "Status": "Present",
  "IsLate": 1,
  "LateMinutes": 15,
  "Notes": "Llegó tarde por tráfico",
  "CheckedInBy": 1,
  "CheckedOutBy": null
}
```
- **Response:**
```json
{
  "AttendanceID": 150,
  "StudentID": 1,
  "Date": "2026-01-23",
  "Status": "Present"
}
```

#### Update attendance record
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/attendance/:id
- **API:** CRUD
- **Request:**
```json
{
  "Status": "Absent",
  "Notes": "Enfermedad"
}
```
- **Response:**
```json
{
  "AttendanceID": 150,
  "Status": "Absent",
  "Notes": "Enfermedad"
}
```

#### Delete attendance record
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/attendance/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/attendance/150)
- **Response:**
```json
{
  "message": "Attendance record deleted successfully",
  "AttendanceID": 150
}
```

---

### Users - Basic CRUD

#### List all users
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/users
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "UserID": 1,
    "UserName": "admin",
    "Email": "admin@nicekids.com",
    "FirstName": "Admin",
    "LastName": "System",
    "IsActive": 1
  }
]
```

#### Get user by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/users/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/users/1)
- **Response:**
```json
{
  "UserID": 1,
  "AuthUserID": "abc-123-def",
  "UserName": "admin",
  "Email": "admin@nicekids.com",
  "FirstName": "Admin",
  "LastName": "System",
  "IsActive": 1
}
```

#### Create user
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/users
- **API:** CRUD
- **Request:**
```json
{
  "UserName": "teacher01",
  "Email": "teacher01@nicekids.com",
  "FirstName": "María",
  "LastName": "López"
}
```
- **Response:**
```json
{
  "UserID": 25,
  "UserName": "teacher01",
  "Email": "teacher01@nicekids.com"
}
```

#### Update user
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/users/:id
- **API:** CRUD
- **Request:**
```json
{
  "FirstName": "María José",
  "Email": "mjlopez@nicekids.com"
}
```
- **Response:**
```json
{
  "UserID": 25,
  "FirstName": "María José",
  "Email": "mjlopez@nicekids.com"
}
```

#### Delete user (logical)
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/users/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/users/25)
- **Response:**
```json
{
  "message": "User deactivated successfully",
  "UserID": 25
}
```

---

## Sprint 2 - Advanced Features

### Student-Guardian Relations

#### List guardians for a student
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/students/:id/guardians
- **API:** CRUD
- **Request:** N/A (ex: /api/students/1/guardians)
- **Response:**
```json
[
  {
    "GuardianID": 1,
    "FirstName": "Ana",
    "LastName": "Pérez",
    "Relationship": "Mother"
  },
  {
    "GuardianID": 2,
    "FirstName": "Luis",
    "LastName": "Pérez",
    "Relationship": "Father"
  }
]
```

#### List students for a guardian
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/guardians/:id/students
- **API:** BUSINESS
- **Request:** N/A (ex: /api/guardians/1/students)
- **Response:**
```json
[
  {
    "StudentID": 1,
    "FirstName": "Juan",
    "LastName": "Pérez",
    "Relationship": "Son"
  },
  {
    "StudentID": 5,
    "FirstName": "María",
    "LastName": "Pérez",
    "Relationship": "Daughter"
  }
]
```

#### Create student-guardian link
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/student-guardians
- **API:** CRUD
- **Request:**
```json
{
  "StudentID": 1,
  "GuardianID": 3,
  "Relationship": "Uncle",
  "IsPrimary": 0
}
```
- **Response:**
```json
{
  "StudentGuardianID": 45,
  "StudentID": 1,
  "GuardianID": 3,
  "Relationship": "Uncle"
}
```

#### Delete student-guardian link
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/student-guardians/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/student-guardians/45)
- **Response:**
```json
{
  "message": "Student-Guardian link deleted successfully",
  "StudentGuardianID": 45
}
```

---

### Student Calculations

#### Get student age
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/students/:id/calculations
- **API:** BUSINESS
- **Request:** N/A (ex: /api/students/1/calculations)
- **Response:**
```json
{
  "age": {
    "years": 7,
    "months": 8,
    "days": 8,
    "totalDays": 2800
  },
  "bday": {
    "daysUntil": 145,
    "nextBirthday": "2026-06-17"
  }
}
```

---

### Attendance Reports

#### Get attendance report by date range
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/reports/attendance
- **API:** BUSINESS
- **Request:** Query params: ?from=2026-01-01&to=2026-01-31&format=json&studentId=1
- **Response:**
```json
{
  "stats": {
    "total": 20,
    "present": 18,
    "absent": 2,
    "late": 3
  },
  "records": [
    {
      "AttendanceID": 1,
      "Date": "2026-01-02",
      "Status": "Present",
      "IsLate": 0,
      "student": {
        "FirstName": "Juan",
        "LastName": "Pérez",
        "GradeID": 2
      }
    }
  ]
}
```

#### Get attendance report in PDF format
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/reports/attendance
- **API:** BUSINESS
- **Request:** Query params: ?from=2026-01-01&to=2026-01-31&format=pdf&studentId=1
- **Response:** PDF file download (Content-Type: application/pdf)

---

### Student Progress Reports

#### Get student progress report
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/reports/student/:id/progress
- **API:** BUSINESS
- **Request:** Query params: ?from=2026-01-01&to=2026-01-31 (ex: /api/reports/student/1/progress)
- **Response:**
```json
{
  "studentId": 1,
  "period": {
    "from": "2026-01-01",
    "to": "2026-01-31"
  },
  "attendance": {
    "total": 20,
    "present": 18,
    "percentage": "90.0"
  },
  "observations": [
    {
      "ObservationID": 1,
      "ObservationDate": "2026-01-15",
      "Observation": "Excelente comportamiento",
      "CreatedBy": 1
    }
  ]
}
```

---

## Sprint 3 - Financial Management

### Student Payments - Basic CRUD

#### List student payments
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/student-payments
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "StudentPaymentID": 1,
    "StudentID": 1,
    "PaymentDate": "2026-01-15",
    "TotalAmount": 150.00,
    "PaidAmount": 150.00,
    "Status": "Paid"
  }
]
```

#### Get payment by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/student-payments/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/student-payments/1)
- **Response:**
```json
{
  "StudentPaymentID": 1,
  "StudentID": 1,
  "ServiceType": "Monthly",
  "Hours": null,
  "RatePerHour": null,
  "MonthlyFee": 150.00,
  "DailyFee": null,
  "TotalAmount": 150.00,
  "PaidAmount": 150.00,
  "BalanceRemaining": 0.00,
  "PaymentDate": "2026-01-15",
  "DueDate": "2026-01-05",
  "PaymentMethod": "Cash",
  "Status": "Paid",
  "IsRecurrent": 1,
  "StartDate": "2026-01-01",
  "EndDate": "2026-01-31",
  "InvoiceNumber": "INV-2026-01-001",
  "TransactionReference": "CASH-123",
  "Notes": "Mensualidad Enero 2026 - Pagado completo",
  "ProcessedBy": 1,
  "CreatedBy": 1,
  "CreatedAt": "2026-01-05T10:00:00.000Z",
  "UpdatedAt": "2026-01-15T14:30:00.000Z"
}
```

#### Create student payment
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/student-payments
- **API:** CRUD
- **Request:**
```json
{
  "StudentID": 1,
  "ServiceType": "Monthly",
  "Hours": null,
  "RatePerHour": null,
  "MonthlyFee": 150.00,
  "DailyFee": null,
  "TotalAmount": 150.00,
  "PaidAmount": 75.00,
  "BalanceRemaining": 75.00,
  "PaymentDate": "2026-02-01",
  "DueDate": "2026-02-05",
  "PaymentMethod": "Transfer",
  "Status": "Partial",
  "IsRecurrent": 1,
  "StartDate": "2026-02-01",
  "EndDate": "2026-02-28",
  "InvoiceNumber": "INV-2026-02-001",
  "TransactionReference": "TXN123456789",
  "Notes": "Pago parcial - Febrero 2026",
  "ProcessedBy": 1,
  "CreatedBy": 1
}
```
- **Response:**
```json
{
  "StudentPaymentID": 85,
  "StudentID": 1,
  "Status": "Partial",
  "TotalAmount": 150.00
}
```

#### Update student payment
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/student-payments/:id
- **API:** CRUD
- **Request:**
```json
{
  "PaidAmount": 150.00,
  "Status": "Paid"
}
```
- **Response:**
```json
{
  "StudentPaymentID": 85,
  "PaidAmount": 150.00,
  "Status": "Paid"
}
```

#### Delete student payment
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/student-payments/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/student-payments/85)
- **Response:**
```json
{
  "message": "Payment deleted successfully",
  "StudentPaymentID": 85
}
```

---

### Student Balance

#### Get student financial balance
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/students/:id/balance
- **API:** BUSINESS
- **Request:** N/A (ex: /api/students/1/balance)
- **Response:**
```json
{
  "studentId": 1,
  "summary": {
    "totalDue": 900.00,
    "totalPaid": 750.00,
    "balance": 150.00
  }
}
```

---

### Invoices - Basic CRUD

#### List invoices
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/invoices
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "InvoiceID": 1,
    "StudentID": 1,
    "InvoiceDate": "2026-01-01",
    "Amount": 150.00,
    "Status": "Paid"
  }
]
```

#### Get invoice by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/invoices/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/invoices/1)
- **Response:**
```json
{
  "InvoiceID": 1,
  "StudentID": 1,
  "InvoiceDate": "2026-01-01",
  "DueDate": "2026-01-15",
  "Amount": 150.00,
  "Status": "Paid",
  "Description": "Mensualidad Enero 2026"
}
```

#### Create invoice
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/invoices
- **API:** CRUD
- **Request:**
```json
{
  "StudentID": 1,
  "InvoiceDate": "2026-02-01",
  "DueDate": "2026-02-15",
  "Amount": 150.00,
  "Description": "Mensualidad Febrero 2026"
}
```
- **Response:**
```json
{
  "InvoiceID": 45,
  "StudentID": 1,
  "Amount": 150.00,
  "Status": "Pending"
}
```

#### Update invoice
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/invoices/:id
- **API:** CRUD
- **Request:**
```json
{
  "Status": "Paid",
  "PaymentDate": "2026-02-10"
}
```
- **Response:**
```json
{
  "InvoiceID": 45,
  "Status": "Paid",
  "PaymentDate": "2026-02-10"
}
```

#### Delete invoice
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/invoices/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/invoices/45)
- **Response:**
```json
{
  "message": "Invoice deleted successfully",
  "InvoiceID": 45
}
```

---

### Teacher Payments - Basic CRUD

#### List teacher payments
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/teacher-payments
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "TeacherPaymentID": 1,
    "EmpID": 1,
    "PaymentDate": "2026-01-31",
    "Amount": 800.00,
    "Status": "Paid"
  }
]
```

#### Get teacher payment by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/teacher-payments/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/teacher-payments/1)
- **Response:**
```json
{
  "TeacherPaymentID": 1,
  "EmpID": 1,
  "PaymentPeriod": "January 2026",
  "PeriodStartDate": "2026-01-01",
  "PeriodEndDate": "2026-01-31",
  "BaseSalary": 800.00,
  "Bonuses": 50.00,
  "Overtime": 0.00,
  "Deductions": 30.00,
  "TotalAmount": 820.00,
  "PaymentDate": "2026-01-31",
  "PaymentMethod": "Transfer",
  "Status": "Paid",
  "TransactionReference": "TXN-BANK-98765",
  "Notes": "Salario Enero 2026",
  "ProcessedBy": 1,
  "CreatedBy": 1,
  "CreatedAt": "2026-01-25T10:00:00.000Z",
  "UpdatedAt": "2026-01-31T16:00:00.000Z"
}
```

#### Create teacher payment
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/teacher-payments
- **API:** CRUD
- **Request:**
```json
{
  "EmpID": 1,
  "PaymentPeriod": "February 2026",
  "PeriodStartDate": "2026-02-01",
  "PeriodEndDate": "2026-02-28",
  "BaseSalary": 800.00,
  "Bonuses": 100.00,
  "Overtime": 50.00,
  "Deductions": 50.00,
  "TotalAmount": 900.00,
  "PaymentDate": "2026-02-28",
  "PaymentMethod": "Transfer",
  "Status": "Pending",
  "TransactionReference": null,
  "Notes": "Salario Febrero 2026 + Bono desempeño",
  "ProcessedBy": 1,
  "CreatedBy": 1
}
```
- **Response:**
```json
{
  "TeacherPaymentID": 25,
  "EmpID": 1,
  "Amount": 800.00,
  "Status": "Pending"
}
```

#### Update teacher payment
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/teacher-payments/:id
- **API:** CRUD
- **Request:**
```json
{
  "Status": "Paid",
  "PaymentDate": "2026-02-28"
}
```
- **Response:**
```json
{
  "TeacherPaymentID": 25,
  "Status": "Paid",
  "PaymentDate": "2026-02-28"
}
```

#### Delete teacher payment
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/teacher-payments/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/teacher-payments/25)
- **Response:**
```json
{
  "message": "Teacher payment deleted successfully",
  "TeacherPaymentID": 25
}
```

---

## Sprint 4 - Activities & Tasks

### Activities - Basic CRUD

#### List activities
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/activities
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "ActivityID": 1,
    "ActivityName": "Pintura",
    "GradeID": 1,
    "ScheduledDate": "2026-01-25",
    "IsActive": 1
  }
]
```

#### Get activity by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/activities/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/activities/1)
- **Response:**
```json
{
  "ActivityID": 1,
  "ActivityName": "Pintura",
  "Description": "Actividad de pintura libre",
  "GradeID": 1,
  "EmpID": 1,
  "ScheduledDate": "2026-01-25",
  "IsActive": 1
}
```

#### Create activity
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/activities
- **API:** CRUD
- **Request:**
```json
{
  "ActivityName": "Música",
  "Description": "Clase de iniciación musical",
  "GradeID": 2,
  "EmpID": 3,
  "ScheduledDate": "2026-01-26"
}
```
- **Response:**
```json
{
  "ActivityID": 45,
  "ActivityName": "Música",
  "IsActive": 1
}
```

#### Update activity
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/activities/:id
- **API:** CRUD
- **Request:**
```json
{
  "ScheduledDate": "2026-01-27",
  "Description": "Clase de música y ritmo"
}
```
- **Response:**
```json
{
  "ActivityID": 45,
  "ScheduledDate": "2026-01-27",
  "Description": "Clase de música y ritmo"
}
```

#### Delete activity (logical)
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/activities/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/activities/45)
- **Response:**
```json
{
  "message": "Activity deactivated successfully",
  "ActivityID": 45
}
```

---

### My Activities Feed

#### Get activities for current user
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/activities/my-feed
- **API:** BUSINESS
- **Request:** N/A (requires authentication - filters by user role)
- **Response:**
```json
[
  {
    "ActivityID": 1,
    "ActivityName": "Pintura",
    "Description": "Actividad de pintura libre",
    "ScheduledDate": "2026-01-25",
    "grade": {
      "GradeName": "Prekinder"
    }
  },
  {
    "ActivityID": 5,
    "ActivityName": "Música",
    "Description": "Clase de música",
    "ScheduledDate": "2026-01-26",
    "grade": {
      "GradeName": "Prekinder"
    }
  }
]
```

---

### Activity Media - Basic CRUD

#### List activity media
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/activity-media
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "MediaID": 1,
    "ActivityID": 1,
    "MediaURL": "https://storage.example.com/photo1.jpg",
    "MediaType": "image"
  }
]
```

#### Get activity media by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/activity-media/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/activity-media/1)
- **Response:**
```json
{
  "MediaID": 1,
  "ActivityID": 1,
  "MediaURL": "https://storage.example.com/photo1.jpg",
  "MediaType": "image",
  "UploadDate": "2026-01-25T14:30:00.000Z"
}
```

#### Create activity media
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/activity-media
- **API:** CRUD
- **Request:**
```json
{
  "ActivityID": 1,
  "MediaURL": "https://storage.example.com/video1.mp4",
  "MediaType": "video"
}
```
- **Response:**
```json
{
  "MediaID": 45,
  "ActivityID": 1,
  "MediaURL": "https://storage.example.com/video1.mp4"
}
```

#### Update activity media
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/activity-media/:id
- **API:** CRUD
- **Request:**
```json
{
  "MediaURL": "https://storage.example.com/photo1_updated.jpg"
}
```
- **Response:**
```json
{
  "MediaID": 45,
  "MediaURL": "https://storage.example.com/photo1_updated.jpg"
}
```

#### Delete activity media
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/activity-media/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/activity-media/45)
- **Response:**
```json
{
  "message": "Activity media deleted successfully",
  "MediaID": 45
}
```

---

### Employee Tasks - Basic CRUD

#### List employee tasks
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/employee-tasks
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "TaskID": 1,
    "EmpID": 1,
    "TaskName": "Preparar material didáctico",
    "DueDate": "2026-01-26",
    "Status": "Pending"
  }
]
```

#### Get employee task by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/employee-tasks/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/employee-tasks/1)
- **Response:**
```json
{
  "TaskID": 1,
  "EmpID": 1,
  "TaskName": "Preparar material didáctico",
  "Description": "Preparar materiales para la clase de arte",
  "DueDate": "2026-01-26",
  "Status": "Pending",
  "Priority": "High"
}
```

#### Create employee task
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/employee-tasks
- **API:** CRUD
- **Request:**
```json
{
  "EmpID": 1,
  "TaskName": "Revisar evaluaciones",
  "Description": "Revisar evaluaciones del mes",
  "DueDate": "2026-01-31",
  "Priority": "Medium"
}
```
- **Response:**
```json
{
  "TaskID": 45,
  "EmpID": 1,
  "TaskName": "Revisar evaluaciones",
  "Status": "Pending"
}
```

#### Update employee task
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/employee-tasks/:id
- **API:** CRUD
- **Request:**
```json
{
  "Status": "Completed",
  "CompletedDate": "2026-01-25"
}
```
- **Response:**
```json
{
  "TaskID": 45,
  "Status": "Completed",
  "CompletedDate": "2026-01-25"
}
```

#### Delete employee task
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/employee-tasks/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/employee-tasks/45)
- **Response:**
```json
{
  "message": "Employee task deleted successfully",
  "TaskID": 45
}
```

---

## Sprint 5 - Observations & Notifications

### Student Observations - Basic CRUD

#### List student observations
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/student-observations
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "ObservationID": 1,
    "StudentID": 1,
    "ObservationDate": "2026-01-20",
    "Observation": "Excelente participación en clase",
    "CreatedBy": 1
  }
]
```

#### Get observation by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/student-observations/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/student-observations/1)
- **Response:**
```json
{
  "ObservationID": 1,
  "StudentID": 1,
  "ObservationDate": "2026-01-20",
  "Observation": "Excelente participación en clase de matemáticas",
  "CreatedBy": 1,
  "CreatedAt": "2026-01-20T10:30:00.000Z"
}
```

#### Create student observation
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/student-observations
- **API:** CRUD
- **Request:**
```json
{
  "StudentID": 1,
  "ObservationDate": "2026-01-23",
  "Observation": "Mostró interés en actividades de arte",
  "CreatedBy": 1
}
```
- **Response:**
```json
{
  "ObservationID": 45,
  "StudentID": 1,
  "ObservationDate": "2026-01-23"
}
```

#### Update student observation
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/student-observations/:id
- **API:** CRUD
- **Request:**
```json
{
  "Observation": "Mostró gran interés y creatividad en actividades de arte"
}
```
- **Response:**
```json
{
  "ObservationID": 45,
  "Observation": "Mostró gran interés y creatividad en actividades de arte"
}
```

#### Delete student observation
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/student-observations/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/student-observations/45)
- **Response:**
```json
{
  "message": "Student observation deleted successfully",
  "ObservationID": 45
}
```

---

### Notifications - Basic CRUD

#### List notifications
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/notifications
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "NotificationID": 1,
    "UserID": 5,
    "Message": "Recordatorio de pago mensualidad",
    "IsRead": 0,
    "CreatedAt": "2026-01-23T08:00:00.000Z"
  }
]
```

#### Get notification by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/notifications/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/notifications/1)
- **Response:**
```json
{
  "NotificationID": 1,
  "UserID": 5,
  "Message": "Recordatorio de pago mensualidad Febrero",
  "Type": "Payment Reminder",
  "IsRead": 0,
  "CreatedAt": "2026-01-23T08:00:00.000Z"
}
```

#### Create notification
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/notifications
- **API:** CRUD
- **Request:**
```json
{
  "UserID": 5,
  "Message": "Nueva actividad programada para mañana",
  "Type": "Activity"
}
```
- **Response:**
```json
{
  "NotificationID": 45,
  "UserID": 5,
  "Message": "Nueva actividad programada para mañana",
  "IsRead": 0
}
```

#### Update notification
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/notifications/:id
- **API:** CRUD
- **Request:**
```json
{
  "IsRead": 1
}
```
- **Response:**
```json
{
  "NotificationID": 45,
  "IsRead": 1
}
```

#### Delete notification
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/notifications/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/notifications/45)
- **Response:**
```json
{
  "message": "Notification deleted successfully",
  "NotificationID": 45
}
```

---

### My Notifications

#### Get current user's notifications
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/notifications/my
- **API:** BUSINESS
- **Request:** N/A (requires authentication)
- **Response:**
```json
{
  "ok": true,
  "data": [],
  "message": "Endpoint de notificaciones pendiente"
}
```

#### Mark notification as read
- **Method:** PATCH
- **URI:** https://nicekidscenter.onrender.com/api/notifications/:id/read
- **API:** BUSINESS
- **Request:** N/A (ex: /api/notifications/5/read)
- **Response:**
```json
{
  "ok": true,
  "message": "Notificación marcada como leída"
}
```

---

## Sprint 6 - Access Control & Permissions

### Roles - Basic CRUD

#### List roles
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/access/role
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "RoleID": 1,
    "RoleName": "Admin",
    "Description": "Administrator with full access",
    "IsActive": 1
  },
  {
    "RoleID": 2,
    "RoleName": "Teacher",
    "Description": "Teaching staff",
    "IsActive": 1
  }
]
```

#### Get role by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/access/role/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/access/role/1)
- **Response:**
```json
{
  "RoleID": 1,
  "RoleName": "Admin",
  "Description": "Administrator with full access",
  "IsActive": 1
}
```

#### Create role
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/access/role
- **API:** CRUD
- **Request:**
```json
{
  "RoleName": "Coordinator",
  "Description": "Academic coordinator"
}
```
- **Response:**
```json
{
  "RoleID": 5,
  "RoleName": "Coordinator",
  "IsActive": 1
}
```

#### Update role
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/access/role/:id
- **API:** CRUD
- **Request:**
```json
{
  "Description": "Academic and administrative coordinator"
}
```
- **Response:**
```json
{
  "RoleID": 5,
  "Description": "Academic and administrative coordinator"
}
```

#### Deactivate role
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/access/role/:id/deactivate
- **API:** CRUD
- **Request:** N/A (ex: /api/access/role/5/deactivate)
- **Response:**
```json
{
  "message": "Role deactivated successfully",
  "RoleID": 5
}
```

---

### Permissions - Basic CRUD

#### List permissions
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/access/permission
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "PermissionID": 1,
    "PermissionName": "Estudiantes",
    "Description": "Gestión de estudiantes"
  },
  {
    "PermissionID": 2,
    "PermissionName": "Responsables",
    "Description": "Gestión de responsables"
  }
]
```

#### Get permission by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/access/permission/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/access/permission/1)
- **Response:**
```json
{
  "PermissionID": 1,
  "PermissionName": "Estudiantes",
  "Description": "Gestión de estudiantes",
  "Category": "Academic"
}
```

#### Create permission
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/access/permission
- **API:** CRUD
- **Request:**
```json
{
  "PermissionName": "Reportes Avanzados",
  "Description": "Acceso a reportes avanzados",
  "Category": "Reports"
}
```
- **Response:**
```json
{
  "PermissionID": 15,
  "PermissionName": "Reportes Avanzados"
}
```

#### Update permission
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/access/permission/:id
- **API:** CRUD
- **Request:**
```json
{
  "Description": "Acceso completo a reportes avanzados y analytics"
}
```
- **Response:**
```json
{
  "PermissionID": 15,
  "Description": "Acceso completo a reportes avanzados y analytics"
}
```

---

### Role-Permission Assignment

#### List role-permission assignments
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/access/role-permission
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "RolePermissionID": 1,
    "RoleID": 1,
    "PermissionID": 1,
    "CanView": 1,
    "CanEdit": 1,
    "CanDelete": 1
  }
]
```

#### Create role-permission assignment
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/access/role-permission
- **API:** CRUD
- **Request:**
```json
{
  "RoleID": 2,
  "PermissionID": 5,
  "CanView": 1,
  "CanEdit": 1,
  "CanDelete": 0
}
```
- **Response:**
```json
{
  "RolePermissionID": 45,
  "RoleID": 2,
  "PermissionID": 5
}
```

#### Delete role-permission assignment
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/access/role-permission/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/access/role-permission/45)
- **Response:**
```json
{
  "message": "Role-Permission assignment deleted successfully",
  "RolePermissionID": 45
}
```

---

### User-Role Assignment

#### List user-role assignments
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/user-roles
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "UserRoleID": 1,
    "UserID": 1,
    "RoleID": 1
  },
  {
    "UserRoleID": 2,
    "UserID": 5,
    "RoleID": 2
  }
]
```

#### Get user-role assignment by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/user-roles/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/user-roles/1)
- **Response:**
```json
{
  "UserRoleID": 1,
  "UserID": 1,
  "RoleID": 1,
  "AssignedDate": "2025-01-01"
}
```

#### Create user-role assignment
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/user-roles
- **API:** CRUD
- **Request:**
```json
{
  "UserID": 10,
  "RoleID": 3
}
```
- **Response:**
```json
{
  "UserRoleID": 45,
  "UserID": 10,
  "RoleID": 3
}
```

#### Update user-role assignment
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/user-roles/:id
- **API:** CRUD
- **Request:**
```json
{
  "RoleID": 4
}
```
- **Response:**
```json
{
  "UserRoleID": 45,
  "RoleID": 4
}
```

#### Delete user-role assignment
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/user-roles/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/user-roles/45)
- **Response:**
```json
{
  "message": "User-Role assignment deleted successfully",
  "UserRoleID": 45
}
```

---

## Sprint 7 - Authentication & User Management

### Authentication

#### Provision new user
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/auth/provision
- **API:** BUSINESS
- **Request:**
```json
{
  "type": "guardian",
  "id": 5,
  "email": "guardian@example.com",
  "firstName": "María",
  "lastName": "González",
  "roleName": "Guardian"
}
```
- **Response:**
```json
{
  "success": true,
  "userId": 25,
  "tempPassword": "NiceKids1234",
  "message": "Usuario creado exitosamente"
}
```

#### Sync Google user
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/auth/sync-google
- **API:** BUSINESS
- **Request:**
```json
{
  "authUserId": "google-oauth-id-123",
  "email": "user@gmail.com",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```
- **Response:**
```json
{
  "success": true,
  "userId": 30,
  "message": "Usuario sincronizado"
}
```

---

### Sessions - Basic CRUD

#### List sessions
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/sessions
- **API:** CRUD
- **Request:** N/A
- **Response:**
```json
[
  {
    "SessionID": 1,
    "UserID": 1,
    "LoginTime": "2026-01-23T08:00:00.000Z",
    "IsActive": 1
  }
]
```

#### Get session by ID
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/sessions/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/sessions/1)
- **Response:**
```json
{
  "SessionID": 1,
  "UserID": 1,
  "LoginTime": "2026-01-23T08:00:00.000Z",
  "LogoutTime": null,
  "IPAddress": "192.168.1.100",
  "IsActive": 1
}
```

#### Create session
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/sessions
- **API:** CRUD
- **Request:**
```json
{
  "UserID": 5,
  "IPAddress": "192.168.1.105"
}
```
- **Response:**
```json
{
  "SessionID": 45,
  "UserID": 5,
  "LoginTime": "2026-01-23T10:30:00.000Z",
  "IsActive": 1
}
```

#### Update session
- **Method:** PUT
- **URI:** https://nicekidscenter.onrender.com/api/sessions/:id
- **API:** CRUD
- **Request:**
```json
{
  "LogoutTime": "2026-01-23T12:00:00.000Z",
  "IsActive": 0
}
```
- **Response:**
```json
{
  "SessionID": 45,
  "LogoutTime": "2026-01-23T12:00:00.000Z",
  "IsActive": 0
}
```

#### Delete session
- **Method:** DELETE
- **URI:** https://nicekidscenter.onrender.com/api/sessions/:id
- **API:** CRUD
- **Request:** N/A (ex: /api/sessions/45)
- **Response:**
```json
{
  "message": "Session deleted successfully",
  "SessionID": 45
}
```

---

## Sprint 8 - Advanced Business Logic

### Fast Intake (Student + Guardian)

#### Create student and guardian in one request
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/students/intake
- **API:** BUSINESS
- **Request:**
```json
{
  "student": {
    "FirstName": "Pedro",
    "LastName": "Ramírez",
    "BirthDate": "2019-07-15",
    "Gender": "Male",
    "DocumentNumber": "1234567899",
    "Address": "Calle Las Flores 321, Quito",
    "Email": "pedro.ramirez@parent.com",
    "PhoneNumber": "0991234567",
    "GradeID": 1,
    "MedicalInfo": "Alergia al polen",
    "EmergencyContact": "Carmen Ramírez",
    "EmergencyPhone": "0991234567",
    "IsRecurrent": 1,
    "EnrollmentDate": "2026-02-01"
  },
  "guardian": {
    "FirstName": "Carmen",
    "LastName": "Ramírez",
    "DocumentNumber": "1723456789",
    "Relationship": "Mother",
    "PhoneNumber": "0991234567",
    "Email": "carmen.ramirez@email.com",
    "Address": "Calle Las Flores 321, Quito",
    "Occupation": "Doctora",
    "WorkPhone": "0223334444",
    "IsEmergencyContact": 1,
    "IsAuthorizedPickup": 1,
    "relationship": "Mother"
  }
}
```
- **Response:**
```json
{
  "success": true,
  "studentId": 50
}
```

---

### Student Deactivation Check

#### Check if student can be deactivated
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/students/:id/can-deactivate
- **API:** BUSINESS
- **Request:** N/A (ex: /api/students/5/can-deactivate)
- **Response:**
```json
{
  "allowed": false,
  "reason": "Tiene pagos pendientes"
}
```

**Alternative response (allowed):**
```json
{
  "allowed": true
}
```

---

## Sprint 9 - Pending/Future Features

### Guardian Notifications

#### Notify a guardian
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/guardians/:id/notify
- **API:** BUSINESS
- **Request:**
```json
{
  "message": "Recordatorio: Reunión de padres mañana a las 18:00"
}
```
- **Response:**
```json
{
  "ok": true,
  "message": "Endpoint de notificación pendiente"
}
```

---

### Guardian Balance

#### Get guardian's payment balance
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/guardians/:id/balance
- **API:** BUSINESS
- **Request:** N/A (ex: /api/guardians/5/balance)
- **Response:**
```json
{
  "ok": true,
  "message": "Endpoint de balance de guardián pendiente"
}
```

---

### Employee Schedules

#### Get employee schedules
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/employees/schedules
- **API:** BUSINESS
- **Request:** N/A
- **Response:**
```json
{
  "ok": true,
  "message": "Endpoint de horarios pendiente"
}
```

---

### Employee Task Assignment

#### Assign task to employee
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/employees/tasks/assign
- **API:** BUSINESS
- **Request:**
```json
{
  "empId": 3,
  "taskName": "Preparar evaluación trimestral",
  "dueDate": "2026-03-31"
}
```
- **Response:**
```json
{
  "ok": true,
  "message": "Endpoint de asignación de tareas pendiente"
}
```

#### Get employee's tasks
- **Method:** GET
- **URI:** https://nicekidscenter.onrender.com/api/employees/:id/tasks
- **API:** BUSINESS
- **Request:** N/A (ex: /api/employees/3/tasks)
- **Response:**
```json
{
  "ok": true,
  "message": "Endpoint de tareas de empleado pendiente"
}
```

---

### Broadcast Notifications

#### Send notification to multiple users
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/notifications/broadcast
- **API:** BUSINESS
- **Request:**
```json
{
  "message": "El centro estará cerrado el 24 de diciembre",
  "targetRole": "Guardian"
}
```
- **Response:**
```json
{
  "ok": true,
  "message": "Endpoint de notificación masiva pendiente"
}
```

---

### Send Individual Notification

#### Send notification to specific user
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/notifications/send
- **API:** BUSINESS
- **Request:**
```json
{
  "userId": 15,
  "message": "Su hijo tiene una tarea pendiente"
}
```
- **Response:**
```json
{
  "ok": true,
  "message": "Endpoint de envío de notificación pendiente"
}
```

---

### Invoice Generation

#### Generate invoice for student
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/finance/invoice/generate
- **API:** BUSINESS
- **Request:**
```json
{
  "studentId": 1,
  "month": "February",
  "year": 2026,
  "amount": 150.00
}
```
- **Response:**
```json
{
  "ok": true,
  "message": "Endpoint de generación de facturas pendiente"
}
```

---

### Payment Registration

#### Register a new payment
- **Method:** POST
- **URI:** https://nicekidscenter.onrender.com/api/finance/payment
- **API:** BUSINESS
- **Request:**
```json
{
  "studentId": 1,
  "amount": 150.00,
  "paymentMethod": "Cash",
  "paymentDate": "2026-01-23"
}
```
- **Response:**
```json
{
  "ok": true,
  "message": "Endpoint de registro de pagos pendiente"
}
```

---

## Notes

### API Authentication
All endpoints (except `/health`) require authentication via Bearer Token:
```
Authorization: Bearer <your-token>
```

### API Permissions
Business endpoints require specific permissions based on the user's role:
- **Estudiantes** - Student management
- **Responsables** - Guardian management
- **Personal** - Staff management
- **Actividades** - Activity management
- **Asistencia** - Attendance management
- **Pagos** - Payment management
- **Notificaciones** - Notification management
- **Usuarios y Roles** - User and role management

### Error Responses
All endpoints may return error responses in the following format:
```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **500** - Internal Server Error

---

**Document Generated:** January 23, 2026
**Project:** Nice Kids Daycare Center
**Version:** 2.0
