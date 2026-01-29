import { Router } from 'express';
import { 
    getUnreadCount,
    getMyNotifications,
    getSentNotifications,
    markNotificationAsRead, 
    markAllAsRead,
    deleteNotification,
    sendSingleNotification,
    broadcastToRole
} from '../controllers/notificationController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/unread-count', requireAuth, getUnreadCount);
router.get('/my', requireAuth, getMyNotifications);
router.get('/sent', requireAuth, getSentNotifications);
router.patch('/:id/read', requireAuth, markNotificationAsRead);
router.patch('/mark-all-read', requireAuth, markAllAsRead);
router.delete('/:id', requireAuth, deleteNotification);
router.post('/send', requireAuth, sendSingleNotification);
router.post('/broadcast-role', requireAuth, broadcastToRole);

export default router;

