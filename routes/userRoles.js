import {Router} from 'express';
import {listUserRoles, getUserRole, createUserRole, updateUserRole, deleteUserRole} from '../models/userRolesModel.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rows = await listUserRoles();
    res.json(rows);
  } catch (err) {
    res.status(500).json({error: err.message});
  } 
});

router.get('/:id', async (req, res) => {
  try {
    const row = await getUserRole(Number(req.params.id));
    if (!row) return res.status(404).json({error: 'Not found'});
    res.json(row);
  } catch (err) {
    res.status(500).json({error: err.message});
  } 
});

router.post('/', async (req, res) => {
  try {
    const row = await createUserRole(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

router.put('/:id', async (req, res) => {
  try {
    const row = await updateUserRole(Number(req.params.id), req.body);
    res.json(row);
  } catch (err) {
    res.status(400).json({error: err.message});
  } 
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteUserRole(Number(req.params.id));
    res.json({success: ok});
  } catch (err) {
    res.status(500).json({error: err.message});
  } 
});

export default router;