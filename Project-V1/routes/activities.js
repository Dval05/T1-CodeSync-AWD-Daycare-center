import { Router } from 'express';
import { listActivities, getActivity, createActivity, updateActivity, deleteActivity, listActivitiesByEmp } from '../models/activitiesModel.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rows = await listActivities();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Activities for a specific staff/teacher by EmpID
router.get('/staff/:id', async (req, res) => {
  try {
    const rows = await listActivitiesByEmp(Number(req.params.id));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await getActivity(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const row = await createActivity(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const row = await updateActivity(Number(req.params.id), req.body);
    res.json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteActivity(Number(req.params.id));
    res.json({ success: ok, message: 'Activity logically deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
