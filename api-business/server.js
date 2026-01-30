import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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