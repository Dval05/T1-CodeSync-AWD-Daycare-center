import { Router } from 'express';

import {
  listStudentObservations,
  getStudentObservation,
  createStudentObservation,
  updateStudentObservation,
  deleteStudentObservation
} from '../models/studentObservationModel.js';
import { createStudentObservation } from '../models/studentObservationModel.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rows = await listStudentObservations();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await getStudentObservation(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const row = await createStudentObservation(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const row = await updateStudentObservation(Number(req.params.id), req.body);
    res.json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteStudentObservation(Number(req.params.id));
    res.json({ success: true, message: 'Student observation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/student-observations', async (req, res) => {
  try {
    const row = await createStudentObservation(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
