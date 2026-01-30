import { Router } from 'express';
import { getStudentBalance, getTeacherBalance } from '../controllers/financeController.js';
import { generateInvoice, registerPayment } from '../controllers/paymentController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/student/:id/balance', requireAuth, requirePermission('Pagos', 'view'), getStudentBalance);
router.get('/teacher/:id/balance', requireAuth, requirePermission('Pagos', 'view'), getTeacherBalance);
router.post('/invoice/generate', requireAuth, requirePermission('Pagos', 'edit'), generateInvoice);
router.post('/payment', requireAuth, requirePermission('Pagos', 'edit'), registerPayment);

// Dev-only test route to generate invoice without auth (local testing)
if (process.env.NODE_ENV !== 'production') {
	// Helper to call internal invoice controller flow
	const generateInvoiceHandler = async (referenceType, referenceId, paymentData) => {
		// If Supabase not configured, return a mocked invoice for local testing
		if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
			return {
				InvoiceID: `MOCK-${Date.now()}`,
				InvoiceNumber: `INV-MOCK-${Date.now()}`,
				InvoiceType: referenceType,
				ReferenceID: referenceId,
				IssueDate: new Date().toISOString().split('T')[0],
				DueDate: paymentData.DueDate || null,
				TotalAmount: paymentData.TotalAmount || 0,
				Status: 'Issued',
				Description: paymentData.Description || 'Mock invoice (no DB)'
			};
		}

		// call InvoiceService directly when Supabase is available
		const { InvoiceService } = await import('../services/InvoiceService.js');
		const svc = new InvoiceService();
		return svc.generateInvoice(referenceType, referenceId, paymentData, null);
	};

	router.post('/invoice/generate-test', async (req, res) => {
		try {
			const { teacherId, studentId, paymentData } = req.body;
			const referenceType = teacherId ? 'Teacher' : 'Student';
			const referenceId = teacherId || studentId;
			if (!referenceId || !paymentData) return res.status(400).json({ error: 'Falta referenceId o paymentData' });
			const invoice = await generateInvoiceHandler(referenceType, referenceId, paymentData);
			res.json({ ok: true, invoice });
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
	});

}

export default router;
