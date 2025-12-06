import { Router } from 'express';
import { listStaff, getStaff, createStaff, updateStaff, deleteStaff, deactivateStaff } from '../models/staffModel.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rows = await listStaff();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await getStaff(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const row = await createStaff(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const row = await updateStaff(Number(req.params.id), req.body);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteStaff(Number(req.params.id));
    res.json({ success: ok, message: 'Staff logically deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/deactivate', async (req, res) => {
  try {
    const ok = await deactivateStaff(Number(req.params.id));
    res.json({ success: ok, message: 'Staff logically deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
