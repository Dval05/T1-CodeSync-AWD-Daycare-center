import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
// routes will be loaded dynamically to avoid hard-failing when DB envs
// are missing during local development.

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Try loading routes dynamically; if they fail (e.g. missing DB envs), continue
// and expose dev-only mock endpoints below so local testing is still possible.
import('./src/routes/index.js')
    .then(mod => {
        app.use('/api', mod.default);
    })
    .catch(err => {
        console.warn('Warning loading routes:', err.message);
        console.warn('Mounting DEV fallback endpoints for local testing...');

        const devRouter = express.Router();

        // Notifications fallback (shape compatible with client expectations)
        devRouter.get('/notifications/unread-count', (req, res) => {
            res.json({ ok: true, count: 0 });
        });

        devRouter.get('/notifications/my', (req, res) => {
            const limit = parseInt(req.query.limit) || 50;
            res.json({ ok: true, data: [] });
        });

        devRouter.get('/notifications/sent', (req, res) => {
            const limit = parseInt(req.query.limit) || 50;
            res.json({ ok: true, data: [] });
        });

        devRouter.patch('/notifications/:id/read', (req, res) => {
            res.json({ ok: true, notification: { NotificationID: req.params.id, IsRead: 1, ReadAt: new Date().toISOString() } });
        });

        devRouter.patch('/notifications/mark-all-read', (req, res) => {
            res.json({ ok: true, count: 0 });
        });

        devRouter.delete('/notifications/:id', (req, res) => {
            res.json({ ok: true, message: 'Notificación eliminada' });
        });

        devRouter.post('/notifications/send', (req, res) => {
            res.json({ ok: true, notification: { NotificationID: `MOCK-${Date.now()}` } });
        });

        devRouter.post('/notifications/broadcast-role', (req, res) => {
            res.json({ ok: true, count: 0 });
        });

        // Minimal finance fallbacks (keep existing test endpoints and add simple ones if needed)
        devRouter.post('/finance/invoice/generate', (req, res) => {
            const { teacherId, studentId, items } = req.body || {};
            const referenceType = teacherId ? 'Teacher' : 'Student';
            const referenceId = teacherId || studentId || 'unknown';
            const total = Array.isArray(items) ? items.reduce((s, it) => s + (Number(it.amount) || 0), 0) : 0;
            return res.json({ ok: true, invoice: {
                InvoiceID: `MOCK-${Date.now()}`,
                InvoiceNumber: `INV-MOCK-${Date.now()}`,
                InvoiceType: referenceType,
                ReferenceID: referenceId,
                IssueDate: new Date().toISOString().split('T')[0],
                DueDate: null,
                TotalAmount: total,
                Status: 'Issued',
                Description: JSON.stringify({ items: items || [] })
            }});
        });

        devRouter.patch('/finance/invoice/:id', (req, res) => {
            res.json({ ok: true });
        });

        devRouter.post('/finance/invoice/:id/cancel', (req, res) => {
            res.json({ ok: true });
        });

        devRouter.get('/finance/invoice/:id/pdf', (req, res) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="invoice-${req.params.id}.pdf"`);
                res.send(pdfBuffer);
            });

            // Simple mock invoice content
            doc.fontSize(18).text('Factura (Mock)', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Invoice ID: ${req.params.id}`);
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`);
            doc.moveDown();
            doc.text('Detalle:', { underline: true });
            doc.text('- Este es un PDF de prueba generado en modo desarrollo.');
            doc.text('- Reemplaza estos endpoints configurando SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
            doc.moveDown();
            doc.text('Total: $0.00', { align: 'right' });
            doc.end();
        });

        devRouter.post('/finance/invoice/:id/email', (req, res) => {
            res.json({ ok: true });
        });

        devRouter.post('/finance/payment', (req, res) => {
            res.json({ ok: true, payment: { PaymentID: `MOCK-${Date.now()}` } });
        });

        app.use('/api', devRouter);
    });

// Health endpoint
app.get('/health', (req, res) => res.json({ status: 'API Business OK', time: new Date() }));

// Dev-only mock endpoints to allow local testing when DB envs are missing
if (process.env.NODE_ENV !== 'production') {
    app.post('/api/finance/invoice/generate-test', (req, res) => {
        const { teacherId, studentId, paymentData } = req.body || {};
        const referenceType = teacherId ? 'Teacher' : 'Student';
        const referenceId = teacherId || studentId || 'unknown';
        if (!paymentData) return res.status(400).json({ error: 'paymentData required' });
        return res.json({ ok: true, invoice: {
            InvoiceID: `MOCK-${Date.now()}`,
            InvoiceNumber: `INV-MOCK-${Date.now()}`,
            InvoiceType: referenceType,
            ReferenceID: referenceId,
            IssueDate: new Date().toISOString().split('T')[0],
            DueDate: paymentData.DueDate || null,
            TotalAmount: paymentData.TotalAmount || 0,
            Status: 'Issued',
            Description: paymentData.Description || 'Mock invoice'
        }});
    });

    app.post('/api/finance/payment-test', (req, res) => {
        const { teacherId, studentId, paymentData } = req.body || {};
        const referenceType = teacherId ? 'Teacher' : 'Student';
        const referenceId = teacherId || studentId || 'unknown';
        if (!paymentData) return res.status(400).json({ error: 'paymentData required' });
        return res.json({ ok: true, payment: {
            PaymentID: `MOCK-${Date.now()}`,
            ReferenceType: referenceType,
            ReferenceID: referenceId,
            PaymentDate: paymentData.PaymentDate || new Date().toISOString().split('T')[0],
            TotalAmount: paymentData.TotalAmount || 0,
            PaidAmount: paymentData.PaidAmount || 0,
            Status: paymentData.PaidAmount >= (paymentData.TotalAmount || 0) ? 'Paid' : 'Pending'
        }});
    });
}

app.listen(PORT, () => {
    console.log(`API Business corriendo en puerto ${PORT}`);
});