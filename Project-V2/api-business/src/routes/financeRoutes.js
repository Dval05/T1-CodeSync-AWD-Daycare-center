import { Router } from 'express';
import { getStudentBalance } from '../controllers/financeController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';
import {
    generateInvoice,
    updateInvoice,
    cancelInvoice,
    getInvoicePdf,
    sendInvoiceEmail,
} from '../controllers/invoiceController.js';

const router = Router();

// Obtener balance de un estudiante
router.get('/student/:id/balance', requireAuth, requirePermission('Pagos', 'view'), getStudentBalance);

// Generar factura
router.post('/invoice/generate', requireAuth, requirePermission('Pagos', 'edit'), generateInvoice);

// Editar factura existente
router.patch('/invoice/:id', requireAuth, requirePermission('Pagos', 'edit'), updateInvoice);

// Anular factura
router.post('/invoice/:id/cancel', requireAuth, requirePermission('Pagos', 'edit'), cancelInvoice);

// Generar PDF de factura
router.get('/invoice/:id/pdf', requireAuth, requirePermission('Pagos', 'view'), getInvoicePdf);

// Enviar factura por email (adjunta PDF)
router.post('/invoice/:id/email', requireAuth, requirePermission('Pagos', 'edit'), sendInvoiceEmail);

export default router;
