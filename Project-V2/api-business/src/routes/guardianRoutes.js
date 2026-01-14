import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// Obtener estudiantes de un guardián
router.get('/:id/students', requireAuth, requirePermission('Responsables', 'view'), async (req, res) => {
    try {
        // TODO: Implementar lógica de consulta de estudiantes por guardián
        res.json({ ok: true, message: 'Endpoint de estudiantes por guardián pendiente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener balance de pagos de un guardián
router.get('/:id/balance', requireAuth, requirePermission('Pagos', 'view'), async (req, res) => {
    try {
        // TODO: Implementar lógica de balance de guardián
        res.json({ ok: true, message: 'Endpoint de balance de guardián pendiente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Notificar a un guardián
router.post('/:id/notify', requireAuth, requirePermission('Notificaciones', 'edit'), async (req, res) => {
    try {
        // TODO: Implementar lógica de notificaciones
        res.json({ ok: true, message: 'Endpoint de notificación pendiente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
