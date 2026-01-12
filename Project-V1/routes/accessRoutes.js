import { Router } from 'express';
import { listPermissions, getPermissionById, createPermission, updatePermission } from '../models/permissionsModel.js';
import { listRoles, getRoleById, createRole, updateRole, deactivateRole } from '../models/rolesModel.js';
import { listRolePermissions, createRolePermission, deleteRolePermission } from '../models/rolePermissionModel.js';

const router = Router();

// ===== Permission (GET ALL) =====
router.get('/permission', async (req, res) => {
  try {
    const permissions = await listPermissions();
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== Permission: GET ONE =====
router.get('/permission/:id', async (req, res) => {
  try {
    const permission = await getPermissionById(req.params.id);
    if (!permission) return res.status(404).json({ message: 'Permission not found' });
    res.json(permission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== Permission: POST =====
router.post('/permission', async (req, res) => {
  try {
    const created = await createPermission(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===== Permission: PUT =====
router.put('/permission/:id', async (req, res) => {
  try {
    const updated = await updatePermission(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Permission not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===== Role: GET ALL =====
router.get('/role', async (req, res) => {
  try {
    const roles = await listRoles();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== Role: GET ONE (UUID _id or numeric RoleID) =====
router.get('/role/:id', async (req, res) => {
  try {
    const role = await getRoleById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== Role: POST (insert) =====
router.post('/role', async (req, res) => {
  try {
    const created = await createRole(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===== Role: PUT (update by UUID or numeric RoleID) =====
router.put('/role/:id', async (req, res) => {
  try {
    const updated = await updateRole(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Role not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===== Role: PUT deactivate (logical by RoleID) =====
router.put('/role/:id/deactivate', async (req, res) => {
  try {
    const updated = await deactivateRole(req.params.id);
    if (!updated) return res.status(404).json({ message: 'Role not found' });
    res.json({ message: 'Role logically deactivated', RoleID: updated.RoleID, role: updated });
  } catch (err) {
    const isBadReq = /RoleID must be numeric/i.test(err.message);
    res.status(isBadReq ? 400 : 500).json({ message: err.message });
  }
});

// ===== RolePermission: GET ALL =====
router.get('/role-permission', async (req, res) => {
  try {
    const rows = await listRolePermissions();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== RolePermission: POST (assign) =====
router.post('/role-permission', async (req, res) => {
  try {
    const created = await createRolePermission(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===== RolePermission: DELETE (by UUID _id or numeric RoleID) =====
router.delete('/role-permission/:id', async (req, res) => {
  try {
    const ok = await deleteRolePermission(req.params.id);
    res.json({ success: ok });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
