import { Router } from 'express';
import { getMyNotifications, markNotificationAsRead, sendBroadcastNotification, sendSingleNotification } from '../controllers/notificationController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/my', requireAuth, getMyNotifications);
router.patch('/:id/read', requireAuth, markNotificationAsRead);
router.post('/broadcast', requireAuth, requirePermission('Notificaciones', 'edit'), sendBroadcastNotification);
router.post('/send', requireAuth, requirePermission('Notificaciones', 'edit'), sendSingleNotification);

export default router;
