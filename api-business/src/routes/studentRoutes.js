import { Router } from 'express';
import { fastIntake, canDeactivate, getStudentCalculations } from '../controllers/studentController.js';
import { getStudentBalance } from '../controllers/financeController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/intake', requireAuth, requirePermission('Estudiantes', 'edit'), fastIntake);
router.get('/:id/can-deactivate', requireAuth, requirePermission('Estudiantes', 'edit'), canDeactivate);
router.get('/:id/calculations', requireAuth, requirePermission('Estudiantes', 'view'), getStudentCalculations);
router.get('/:id/balance', requireAuth, requirePermission('Pagos', 'view'), getStudentBalance);
export default router;