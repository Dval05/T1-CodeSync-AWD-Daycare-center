import express from 'express';
import { getAll, getById, create, update, remove } from '../controllers/genericController.js';
import { authCheck } from '../middleware/authCheck.js';

const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ 
        status: 'API CRUD OK', 
        timestamp: new Date().toISOString(),
        env_check: process.env.SUPABASE_URL ? 'OK' : 'FAIL' 
    });
});

router.get('/:resource', authCheck, getAll);
router.get('/:resource/:id', authCheck, getById);
router.post('/:resource', authCheck, create);
router.put('/:resource/:id', authCheck, update);
router.delete('/:resource/:id', authCheck, remove);

export default router;