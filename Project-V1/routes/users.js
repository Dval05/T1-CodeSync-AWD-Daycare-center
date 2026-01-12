import { Router } from 'express';
import { listUsers, getUser, createUser, updateUser, deleteUser } from '../models/usersModel.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rows = await listUsers();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await getUser(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const row = await createUser(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const row = await updateUser(Number(req.params.id), req.body);
    res.json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteUser(Number(req.params.id));
    res.json({ success: ok, message: 'User logically deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
