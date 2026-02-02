import { Router } from 'express';
import { getStudentBalance, getTeacherBalance } from '../controllers/financeController.js';
import { generateInvoice, registerPayment, updatePayment, deletePayment, listPayments, getPaymentPdf, emailPaymentReceipt } from '../controllers/paymentController.js';
import { getInvoicePdf } from '../controllers/invoiceController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/student/:id/balance', requireAuth, requirePermission('Pagos', 'view'), getStudentBalance);
router.get('/teacher/:id/balance', requireAuth, requirePermission('Pagos', 'view'), getTeacherBalance);
router.post('/invoice/generate', requireAuth, requirePermission('Pagos', 'edit'), generateInvoice);
router.post('/payment', requireAuth, requirePermission('Pagos', 'edit'), registerPayment);
router.patch('/payment/:id', requireAuth, requirePermission('Pagos', 'edit'), updatePayment);
router.delete('/payment/:id', requireAuth, requirePermission('Pagos', 'edit'), deletePayment);
router.get('/payments', requireAuth, requirePermission('Pagos', 'view'), listPayments);
router.get('/payment/:id/pdf', requireAuth, requirePermission('Pagos', 'view'), getPaymentPdf);
router.post('/payment/:id/email', requireAuth, requirePermission('Pagos', 'edit'), emailPaymentReceipt);
router.get('/invoice/:id/pdf', requireAuth, requirePermission('Pagos', 'view'), getInvoicePdf);

export default router;
