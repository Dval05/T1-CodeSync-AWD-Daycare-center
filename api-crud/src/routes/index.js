import express from 'express';
import { getAll, getById, create, update, remove } from '../controllers/genericController.js';
import { createUser, updateUser, login, changePassword, resetPasswordToID } from '../controllers/userController.js';
import { getRolePermissions } from '../controllers/accessController.js';
import { authCheck } from '../middleware/authCheck.js';

const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ 
        status: 'API CRUD OK', 
        timestamp: new Date().toISOString(),
        env_check: process.env.SUPABASE_URL ? 'OK' : 'FAIL' 
    });
});

// Rutas especiales para usuarios (sin authCheck en login)
router.post('/auth/login', login);
router.post('/auth/change-password', changePassword);
router.post('/auth/reset-password-to-id', authCheck, resetPasswordToID);
router.post('/user', authCheck, createUser); // Crear usuario con cédula
router.put('/user/:id', authCheck, updateUser); // Actualizar usuario con hash

// Endpoints de acceso avanzados
router.get('/access/role/:id/permissions', authCheck, getRolePermissions);

// Rutas genéricas
router.get('/:resource', authCheck, getAll);
router.get('/:resource/:id', authCheck, getById);
router.post('/:resource', authCheck, create);
router.put('/:resource/:id', authCheck, update);
router.delete('/:resource/:id', authCheck, remove);

export default router;