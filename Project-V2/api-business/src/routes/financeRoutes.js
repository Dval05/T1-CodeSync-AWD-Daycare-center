import { Router } from 'express';
import { getStudentBalance } from '../controllers/financeController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// Obtener balance de un estudiante
router.get('/student/:id/balance', requireAuth, requirePermission('Pagos', 'view'), getStudentBalance);

// Generar factura para un estudiante
router.post('/invoice/generate', requireAuth, requirePermission('Pagos', 'edit'), async (req, res) => {
    try {
        // TODO: Implementar lógica de generación de facturas
        res.json({ ok: true, message: 'Endpoint de generación de facturas pendiente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Registrar pago
router.post('/payment', requireAuth, requirePermission('Pagos', 'edit'), async (req, res) => {
    try {
        // TODO: Implementar lógica de registro de pagos
        res.json({ ok: true, message: 'Endpoint de registro de pagos pendiente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
