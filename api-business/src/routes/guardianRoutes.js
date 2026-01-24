import { Router } from 'express';
import { getGuardianStudents, getGuardianBalance, notifyGuardian } from '../controllers/guardianController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:id/students', requireAuth, requirePermission('Responsables', 'view'), getGuardianStudents);
router.get('/:id/balance', requireAuth, requirePermission('Pagos', 'view'), getGuardianBalance);
router.post('/:id/notify', requireAuth, requirePermission('Notificaciones', 'edit'), notifyGuardian);

export default router;
