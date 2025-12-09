import { Router } from 'express';
import { listStudents, getStudent, createStudent, updateStudent, deleteStudent, deactivateStudent } from '../models/studentsModel.js';
import { calculateStudyTime, calculateAge, daysUntilBirthday } from '../utils/studentCalculations.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rows = await listStudents();
    res.json(rows);
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

export default router;
