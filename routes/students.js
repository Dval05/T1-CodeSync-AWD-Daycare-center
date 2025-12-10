import { Router } from 'express';
import { listStudents, getStudent, createStudent, updateStudent, deleteStudent, deactivateStudent, studentProgressReport } from '../models/studentsModel.js';
import { calculateStudyTime, calculateAge, daysUntilBirthday } from '../utils/studentCalculations.js';
import { listGuardiansForStudent, listAttendanceForStudent, listPaymentsForStudent, paymentsSummaryForStudent } from '../models/studentsModel.js';
import { getMonthlyAttendanceSummary } from "../models/attendanceModel.js";


const router = Router();

router.get('/', async (req, res) => {
  try {
    const rows = await listStudents();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/monthly-attendance-summary", async (req, res) => {
  try {
    const studentId = Number(req.params.id);

    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if (!year || !month)
      return res.status(400).json({ error: "Debe enviar year y month. Ej: ?year=2025&month=1" });

    const summary = await getMonthlyAttendanceSummary(studentId, year, month);
    res.json(summary);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await getStudent(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const row = await createStudent(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const row = await updateStudent(Number(req.params.id), req.body);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteStudent(Number(req.params.id));
    res.json({ success: ok, message: 'Student logically deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/deactivate', async (req, res) => {
  try {
    const ok = await deactivateStudent(Number(req.params.id));
    res.json({ success: ok, message: 'Student logically deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/study-time', async (req, res) => {
  try {
    const student = await getStudent(Number(req.params.id));
    if (!student) return res.status(404).json({ error: 'Not found' });

    const result = calculateStudyTime(student.EnrollmentDate);
    res.json({ studentId: student.StudentID, ...result });
  } catch (err) {
    const status = err.message.toLowerCase().includes('invalid') ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

router.get('/:id/age', async (req, res) => {
  try {
    const student = await getStudent(Number(req.params.id));
    if (!student) return res.status(404).json({ error: 'Not found' });

    const result = calculateAge(student.BirthDate);
    res.json({ studentId: student.StudentID, ...result });
  } catch (err) {
    const status = err.message.toLowerCase().includes('invalid') ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

router.get('/:id/birthday-countdown', async (req, res) => {
  try {
    const student = await getStudent(Number(req.params.id));
    if (!student) return res.status(404).json({ error: 'Not found' });

    const result = daysUntilBirthday(student.BirthDate);
    res.json({ studentId: student.StudentID, ...result });
  } catch (err) {
    const status = err.message.toLowerCase().includes('invalid') ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

// List guardians of a student
router.get('/:id/guardians', async (req, res) => {
  try {
    const rows = await listGuardiansForStudent(Number(req.params.id));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Attendance for a student with optional date range
router.get('/:id/attendance', async (req, res) => {
  try {
    const { from, to } = req.query;
    const rows = await listAttendanceForStudent(Number(req.params.id), from, to);
    // basic summary
    const present = (rows || []).filter(r => {
      const status = (r.Status || '').toString().toLowerCase();
      return status === 'present' || r.CheckInTime != null;
    }).length;
    const total = (rows || []).length;
    res.json({ total, present, records: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payments list and summary
router.get('/:id/payments', async (req, res) => {
  try {
    const rows = await listPaymentsForStudent(Number(req.params.id));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/payments/summary', async (req, res) => {
  try {
    const summary = await paymentsSummaryForStudent(Number(req.params.id));
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student progress report: aggregates attendance and observations
router.get('/:id/progress-report', async (req, res) => {
  try {
    const { from, to } = req.query;
    const report = await studentProgressReport(Number(req.params.id), from, to);
    if (!report) return res.status(404).json({ error: 'Student not found or no data' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;
