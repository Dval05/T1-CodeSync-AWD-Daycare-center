import { Router } from 'express';
import { getAttendanceReport, getStudentProgressReport } from '../controllers/reportController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/attendance', requireAuth, requirePermission('Asistencia', 'view'), getAttendanceReport);
router.get('/student/:id/progress', requireAuth, requirePermission('Estudiantes', 'view'), getStudentProgressReport);
export default router;