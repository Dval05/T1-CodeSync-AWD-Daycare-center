import { Router } from 'express';
import { getStudentBalance } from '../controllers/financeController.js';
import { generateInvoice, registerPayment } from '../controllers/paymentController.js';
import { getInvoicePdf } from '../controllers/invoiceController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/student/:id/balance', requireAuth, requirePermission('Pagos', 'view'), getStudentBalance);
router.post('/invoice/generate', requireAuth, requirePermission('Pagos', 'edit'), generateInvoice);
router.post('/payment', requireAuth, requirePermission('Pagos', 'edit'), registerPayment);
router.get('/invoice/:id/pdf', requireAuth, requirePermission('Pagos', 'view'), getInvoicePdf);

export default router;
