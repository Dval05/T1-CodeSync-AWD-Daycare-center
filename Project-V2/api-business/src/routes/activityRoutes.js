import { Router } from 'express';
import { getMyActivities } from '../controllers/activityController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/my-feed', requireAuth, requirePermission('Actividades', 'view'), getMyActivities);
export default router;