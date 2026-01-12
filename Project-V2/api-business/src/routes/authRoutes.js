import { Router } from 'express';
import { provisionUser, syncGoogleUser } from '../controllers/authController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/provision', requireAuth, requirePermission('Usuarios y Roles', 'edit'), provisionUser);
router.post('/sync-google', requireAuth, syncGoogleUser);
export default router;