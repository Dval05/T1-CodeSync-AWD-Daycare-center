import { NotificationService } from '../services/NotificationService.js';

const notificationService = new NotificationService();

export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user?.internalId;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const count = await notificationService.getUnreadCount(userId);
        res.json({ ok: true, count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user?.internalId;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const limit = parseInt(req.query.limit) || 50;
        const notifications = await notificationService.getUserNotifications(userId, limit);

        res.json({ ok: true, data: notifications });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.internalId;

        const notification = await notificationService.markAsRead(id, userId);
        res.json({ ok: true, notification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user?.internalId;
        const notifications = await notificationService.markAllAsRead(userId);
        res.json({ ok: true, count: notifications.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.internalId;

        await notificationService.deleteNotification(id, userId);
        res.json({ ok: true, message: 'Notificación eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const sendSingleNotification = async (req, res) => {
    try {
        const { receiverId, subject, message, type, priority, relatedModule, relatedId } = req.body;

        if (!receiverId || !message) {
            return res.status(400).json({ error: 'receiverId y message son requeridos' });
        }

        const notificationData = {
            Type: type || 'Message',
            Priority: priority || 'Normal',
            Subject: subject || 'Notificación',
            Message: message,
            RelatedModule: relatedModule,
            RelatedID: relatedId
        };

        const senderId = req.user?.internalId || null;
        const notification = await notificationService.sendNotification(receiverId, notificationData, senderId);

        res.json({ ok: true, notification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const broadcastToRole = async (req, res) => {
    try {
        const { roleId, subject, message, type, priority, relatedModule, relatedId } = req.body;

        if (!roleId || !message) {
            return res.status(400).json({ error: 'roleId y message son requeridos' });
        }

        const notificationData = {
            Type: type || 'Alert',
            Priority: priority || 'Normal',
            Subject: subject || 'Notificación',
            Message: message,
            RelatedModule: relatedModule,
            RelatedID: relatedId
        };

        const senderId = req.user?.internalId || null;
        const notifications = await notificationService.broadcastToRole(roleId, notificationData, senderId);

        res.json({ ok: true, count: notifications.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSentNotifications = async (req, res) => {
    try {
        const userId = req.user?.internalId;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const limit = parseInt(req.query.limit) || 50;
        const notifications = await notificationService.getSentNotifications(userId, limit);

        res.json({ ok: true, data: notifications });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
