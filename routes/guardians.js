import { Router } from 'express';
import { 
        listGuardians,
        getGuardian, 
        createGuardian, 
        updateGuardian, 
        deleteGuardian, 
        deactivateGuardian,
        listStudentsForGuardian } from '../models/guardiansModel.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rows = await listGuardians();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await getGuardian(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const row = await createGuardian(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const row = await updateGuardian(Number(req.params.id), req.body);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteGuardian(Number(req.params.id));
    res.json({ success: ok, message: 'Guardian logically deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/deactivate', async (req, res) => {
  try {
    const ok = await deactivateGuardian(Number(req.params.id));
    res.json({ success: ok, message: 'Guardian logically deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/students', async (req, res) => {
  try {
    const rows = await listStudentsForGuardian(Number(req.params.id));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
