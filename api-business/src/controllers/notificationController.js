import { NotificationService } from '../services/NotificationService.js';

const notificationService = new NotificationService();

export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ 
                error: 'Usuario no autenticado' 
            });
        }

        const notifications = await notificationService.getUserNotifications(userId);

        res.json({ 
            ok: true, 
            data: notifications
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await notificationService.markAsRead(id);

        res.json({ 
            ok: true, 
            notification,
            message: 'Notificación marcada como leída'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const sendBroadcastNotification = async (req, res) => {
    try {
        const { receiverIds, subject, message, type, priority } = req.body;

        if (!receiverIds || !Array.isArray(receiverIds) || receiverIds.length === 0) {
            return res.status(400).json({ 
                error: 'Se requiere un array de receiverIds' 
            });
        }

        if (!message) {
            return res.status(400).json({ 
                error: 'El mensaje es requerido' 
            });
        }

        const notificationData = {
            Type: type || 'Message',
            Priority: priority || 'Normal',
            Subject: subject || 'Notificación',
            Message: message
        };

        const senderId = req.user?.userId || null;
        const notifications = await notificationService.sendBroadcast(
            receiverIds, 
            notificationData, 
            senderId
        );

        res.json({ 
            ok: true, 
            notifications,
            message: `Notificación enviada a ${notifications.length} usuarios`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const sendSingleNotification = async (req, res) => {
    try {
        const { receiverId, subject, message, type, priority, relatedModule, relatedId } = req.body;

        if (!receiverId) {
            return res.status(400).json({ 
                error: 'Se requiere receiverId' 
            });
        }

        if (!message) {
            return res.status(400).json({ 
                error: 'El mensaje es requerido' 
            });
        }

        const notificationData = {
            Type: type || 'Message',
            Priority: priority || 'Normal',
            Subject: subject || 'Notificación',
            Message: message,
            RelatedModule: relatedModule || null,
            RelatedID: relatedId || null
        };

        const senderId = req.user?.userId || null;
        const notification = await notificationService.sendNotification(
            receiverId, 
            notificationData, 
            senderId
        );

        res.json({ 
            ok: true, 
            notification,
            message: 'Notificación enviada exitosamente'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
