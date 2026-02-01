import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import axios from 'axios';
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

        devRouter.get('/finance/invoice/:id/pdf', async (req, res) => {
            // Generate a real invoice PDF by fetching data from API-CRUD
            const CRUD_BASE = process.env.API_CRUD_URL || process.env.VITE_API_CRUD_URL || 'http://localhost:3001/api';
            try {
                const { data } = await axios.get(`${CRUD_BASE}/invoice/${req.params.id}`, {
                    headers: { Authorization: req.headers.authorization || '' }
                });
                const invoice = data; // genericController returns the row directly

                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(chunks);
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.InvoiceNumber || req.params.id}.pdf"`);
                    res.send(pdfBuffer);
                });

                const currency = (n) => `$${Number(n || 0).toFixed(2)}`;
                const pageWidth = doc.page.width;
                const margin = 50;
                const contentWidth = pageWidth - margin * 2;
                const leftX = margin;
                const rightX = margin + contentWidth;

                doc.font('Helvetica-Bold').fontSize(20).text('Factura', { align: 'center' });
                doc.moveDown(0.5);
                doc.font('Helvetica').fontSize(11).text(`Factura #: ${invoice.InvoiceNumber || req.params.id}`, { align: 'center' });
                doc.moveDown(1.2);

                doc.font('Helvetica-Bold').fontSize(12).text('Información');
                doc.moveDown(0.2);
                doc.strokeColor('#aaa').moveTo(leftX, doc.y).lineTo(rightX, doc.y).stroke();
                doc.moveDown(0.5);

                const issue = invoice.IssueDate || '-';
                const due = invoice.DueDate || '-';
                const studentId = invoice.ReferenceID || '-';
                const status = invoice.Status || 'Emitida';

                doc.font('Helvetica').fontSize(11);
                doc.text(`Fecha de emisión: ${issue}`);
                doc.text(`Fecha de vencimiento: ${due}`);
                doc.text(`Estudiante: ID ${studentId}`);
                doc.text(`Estado: ${status}`);
                doc.moveDown(1.2);

                doc.font('Helvetica-Bold').text('Detalle de Conceptos');
                doc.moveDown(0.2);
                doc.strokeColor('#aaa').moveTo(leftX, doc.y).lineTo(rightX, doc.y).stroke();
                doc.moveDown(0.5);

                let items = [];
                try {
                    const parsed = invoice.Description ? JSON.parse(invoice.Description) : {};
                    items = Array.isArray(parsed.items) ? parsed.items : [];
                } catch {}

                const conceptColWidth = contentWidth - 140;
                const amountColWidth = 140;
                doc.font('Helvetica-Bold').fontSize(10);
                doc.text('Concepto', leftX, doc.y, { width: conceptColWidth });
                doc.text('Monto', leftX + conceptColWidth, doc.y, { width: amountColWidth, align: 'right' });
                doc.moveDown(0.2);
                doc.strokeColor('#aaa').moveTo(leftX, doc.y).lineTo(rightX, doc.y).stroke();

                doc.font('Helvetica').fontSize(10);
                if (items.length === 0) {
                    doc.moveDown(0.5);
                    doc.text('Sin conceptos registrados.');
                } else {
                    items.forEach((it) => {
                        const concept = it.concept || 'Concepto';
                        const amount = currency(it.amount);
                        doc.moveDown(0.3);
                        const rowTop = doc.y;
                        doc.text(concept, leftX, rowTop, { width: conceptColWidth });
                        doc.text(amount, leftX + conceptColWidth, rowTop, { width: amountColWidth, align: 'right' });
                    });
                    doc.moveDown(0.3);
                    doc.strokeColor('#ddd').moveTo(leftX, doc.y).lineTo(rightX, doc.y).stroke();
                }

                const subtotal = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
                const taxes = Number(invoice.TaxAmount || 0);
                const discounts = Number(invoice.DiscountAmount || 0);
                const finalFromInvoice = Number(invoice.FinalAmount || invoice.TotalAmount || 0);
                const total = finalFromInvoice || Math.max(0, subtotal + taxes - discounts);

                doc.moveDown(1);
                doc.font('Helvetica-Bold').fontSize(12).text('Resumen de Pago', leftX + conceptColWidth, doc.y);
                doc.moveDown(0.2);
                const summaryStartY = doc.y;
                doc.strokeColor('#aaa').moveTo(leftX + conceptColWidth, summaryStartY).lineTo(rightX, summaryStartY).stroke();
                doc.moveDown(0.5);

                doc.font('Helvetica').fontSize(11);
                const summaryWidth = amountColWidth;
                const labelWidth = conceptColWidth;
                const labelX = leftX + conceptColWidth - 10;
                const valueX = leftX + conceptColWidth;
                const summaryRow = (label, value) => {
                    const y = doc.y;
                    doc.text(label, labelX, y, { width: labelWidth, align: 'right' });
                    doc.text(value, valueX, y, { width: summaryWidth, align: 'right' });
                    doc.moveDown(0.2);
                };
                summaryRow('Subtotal:', currency(subtotal));
                summaryRow('Impuestos:', currency(taxes));
                summaryRow('Descuentos:', currency(discounts));
                doc.moveDown(0.2);
                doc.font('Helvetica-Bold');
                summaryRow('Total a pagar:', currency(total));
                doc.font('Helvetica');

                doc.moveDown(1.5);
                doc.fontSize(8).fillColor('#666').text(`Generado el ${new Date().toLocaleString('es-ES')}`, { align: 'right' });
                doc.end();
            } catch (err) {
                console.error('PDF fallback error:', err.message);
                res.status(500).json({ error: 'No se pudo generar el PDF en modo desarrollo.' });
            }
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