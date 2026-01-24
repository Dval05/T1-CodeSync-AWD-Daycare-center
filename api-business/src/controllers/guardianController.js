import { GuardianService } from '../services/GuardianService.js';
import { NotificationService } from '../services/NotificationService.js';
import supabase from '../config/supabase.js';

const guardianService = new GuardianService();
const notificationService = new NotificationService();

export const getGuardianStudents = async (req, res) => {
    try {
        const { id } = req.params;

        const students = await guardianService.getGuardianStudents(id);

        res.json({ 
            ok: true, 
            students
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getGuardianBalance = async (req, res) => {
    try {
        const { id } = req.params;

        const balance = await guardianService.getGuardianBalance(id);

        res.json({ 
            ok: true, 
            balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const notifyGuardian = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, message, type, priority } = req.body;

        if (!message) {
            return res.status(400).json({ 
                error: 'El mensaje es requerido' 
            });
        }

        const guardian = await guardianService.getGuardianById(id);

        if (!guardian.UserID) {
            return res.status(400).json({ 
                error: 'El responsable no tiene usuario asociado para recibir notificaciones' 
            });
        }

        const notificationData = {
            Type: type || 'Message',
            Priority: priority || 'Normal',
            Subject: subject || 'Notificación',
            Message: message,
            RelatedModule: 'Responsables',
            RelatedID: parseInt(id)
        };

        const senderId = req.user?.userId || null;
        const notification = await notificationService.sendNotification(
            guardian.UserID, 
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
