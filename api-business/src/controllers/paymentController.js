import { InvoiceService } from '../services/InvoiceService.js';
import { PaymentService } from '../services/PaymentService.js';

const invoiceService = new InvoiceService();
const paymentService = new PaymentService();

export const generateInvoice = async (req, res) => {
    try {
        const { studentId, paymentData, items, month } = req.body;

        if (!studentId) {
            return res.status(400).json({ error: 'studentId es requerido' });
        }

        let payload = paymentData;
        // Permitir nuevo formato: items + month
        if (!payload && Array.isArray(items)) {
            const subtotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
            if (subtotal <= 0 || items.some(it => !it.concept || Number(it.amount) <= 0)) {
                return res.status(400).json({ error: 'Conceptos inválidos: monto > 0 y concepto requerido' });
            }
            // Derivar DueDate del mes
            let dueDate = new Date().toISOString().split('T')[0];
            if (typeof month === 'string' && month.includes('-')) {
                const [y, m] = month.split('-').map(Number);
                const lastDay = new Date(y, m, 0);
                dueDate = lastDay.toISOString().split('T')[0];
            }

            payload = {
                TotalAmount: subtotal,
                TaxAmount: 0,
                DiscountAmount: 0,
                FinalAmount: subtotal,
                Description: JSON.stringify({ items }),
                DueDate: dueDate,
            };
        }

        if (!payload) {
            return res.status(400).json({ error: 'Se requiere paymentData o items' });
        }

        const createdBy = req.user?.internalId || req.user?.userId || null;
        const invoice = await invoiceService.generateInvoice(studentId, payload, createdBy);

        res.json({ ok: true, invoice, message: 'Factura generada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const registerPayment = async (req, res) => {
    try {
        const { studentId, ...paymentData } = req.body;

        if (!studentId) {
            return res.status(400).json({ 
                error: 'Se requiere studentId' 
            });
        }

        const processedBy = req.user?.userId || null;
        const payment = await paymentService.registerPayment(studentId, paymentData, processedBy);

        res.json({ 
            ok: true, 
            payment,
            message: 'Pago registrado exitosamente'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const payment = await paymentService.updatePayment(id, updateData);

        res.json({ 
            ok: true, 
            payment,
            message: 'Pago actualizado exitosamente'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPaymentsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const payments = await paymentService.getPaymentsByStudent(studentId);

        res.json({ 
            ok: true, 
            payments
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
