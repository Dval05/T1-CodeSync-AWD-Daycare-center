import { Router } from 'express';
import { listAttendance, getAttendance, createAttendance, updateAttendance, deleteAttendance, listAttendanceRecords, reportAttendance, reportAttendanceByClass, listLateArrivals } from '../models/attendanceModel.js';

const router = Router();
// List late arrivals: optional query `date=YYYY-MM-DD` and `thresholdMinutes` (default 0)
router.get('/late', async (req, res) => {
  try {
    const { date, thresholdMinutes } = req.query;
    const rows = await listLateArrivals(date, thresholdMinutes ? Number(thresholdMinutes) : 0);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const rows = await listAttendance();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await getAttendance(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const row = await createAttendance(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const row = await updateAttendance(Number(req.params.id), req.body);
    res.json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteAttendance(Number(req.params.id));
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Attendance report endpoint
router.get('/report', async (req, res) => {
  try {
    const { from, to, groupBy } = req.query;
    const result = await reportAttendance(from, to, groupBy || 'student');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New: report grouped by class (avoids student-level .in() queries)
router.get('/report/class', async (req, res) => {
  try {
    const { from, to } = req.query;
    const result = await reportAttendanceByClass(from, to);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
