// Esquemas de validación por recurso (dinámicos)
// Usar campos: required, type ('string'|'number'|'boolean'|'date'), range {min,max}, format ('iso-date'...)

export const schemas = {
  user: {
    IDNumber: { required: true, format: 'cedula' },
    Email: { required: true, type: 'string' },
    FirstName: { required: true, type: 'string' },
    LastName: { required: true, type: 'string' },
    IsActive: { type: 'boolean' }
  },
  attendance: {
    StudentID: { required: true, type: 'number' },
    Date: { required: true, type: 'date', format: 'iso-date' },
    Status: { required: true, type: 'string' },
    IsLate: { type: 'boolean' },
    CheckInTime: { type: 'string' },
    CheckOutTime: { type: 'string' }
  },
  activity: {
    Name: { required: true, type: 'string' },
    EmpID: { type: 'number' },
    GradeID: { type: 'number' },
    ScheduledDate: { type: 'date', format: 'iso-date' },
    StartTime: { type: 'string' },
    EndTime: { type: 'string' },
    Location: { type: 'string' },
    Category: { type: 'string' },
    IsActive: { type: 'boolean' }
  },
  teacher_payment: {
    EmpID: { required: true, type: 'number' },
    Period: { required: true, type: 'string' }, // YYYY-MM
    PaymentDate: { type: 'date', format: 'iso-date' },
    Amount: { required: true, type: 'number', range: { min: 0 } },
    Notes: { type: 'string' },
    Status: { type: 'string' }
  },
};
