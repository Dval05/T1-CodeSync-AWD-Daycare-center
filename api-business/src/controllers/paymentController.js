import { InvoiceService } from '../services/InvoiceService.js';
import { PaymentService } from '../services/PaymentService.js';

const invoiceService = new InvoiceService();
const paymentService = new PaymentService();

export const generateInvoice = async (req, res) => {
    try {
<<<<<<< HEAD
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
=======
        const { studentId, teacherId, paymentData } = req.body;

        if ((!studentId && !teacherId) || !paymentData) {
            return res.status(400).json({ 
                error: 'Se requiere studentId o teacherId y paymentData' 
            });
        }

        const createdBy = req.user?.userId || null;
        const referenceType = teacherId ? 'Teacher' : 'Student';
        const referenceId = teacherId || studentId;
        const invoice = await invoiceService.generateInvoice(referenceType, referenceId, paymentData, createdBy);
>>>>>>> d9d760276aa75b7cef58f536b36576605bf879ac

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
        const { studentId, teacherId, ...paymentData } = req.body;

        if (!studentId && !teacherId) {
            return res.status(400).json({ 
                error: 'Se requiere studentId o teacherId' 
            });
        }

        const processedBy = req.user?.userId || null;
        let payment;
        if (teacherId) {
            payment = await paymentService.registerTeacherPayment(teacherId, paymentData, processedBy);
        } else {
            payment = await paymentService.registerPayment(studentId, paymentData, processedBy);
        }

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
        // Determine if the id belongs to a teacher payment first
        let updatedPayment = null;
        try {
            const existingTeacherPayment = await paymentService.getTeacherPaymentById(id).catch(() => null);
            if (existingTeacherPayment) {
                // Update teacher payment
                updatedPayment = await paymentService.updateTeacherPayment(id, updateData);

                // If status is Paid, generate invoice and attach reference
                if (updatedPayment && (updatedPayment.Status === 'Paid')) {
                    try {
                        const referenceType = 'Teacher';
                        const referenceId = updatedPayment.EmpID;
                        const createdBy = req.user?.userId || null;
                        const invoicePaymentData = {
                            TotalAmount: updatedPayment.TotalAmount,
                            Description: `Pago profesor #${updatedPayment.TeacherPaymentID}`
                        };
                        const invoice = await invoiceService.generateInvoice(referenceType, referenceId, invoicePaymentData, createdBy);
                        // Attach invoice number to payment
                        if (invoice?.InvoiceNumber) {
                            await paymentService.updateTeacherPayment(updatedPayment.TeacherPaymentID, { TransactionReference: invoice.InvoiceNumber }).catch(() => null);
                            // refresh updatedPayment
                            updatedPayment = await paymentService.getTeacherPaymentById(id).catch(() => updatedPayment);
                        }
                    } catch (err) {
                        console.warn('Error generating invoice after payment update:', err.message);
                    }
                }
            } else {
                // Not a teacher payment, update generic student payment
                updatedPayment = await paymentService.updatePayment(id, updateData);
            }
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ 
            ok: true, 
            payment: updatedPayment,
            message: 'Pago actualizado exitosamente'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPaymentsByStudent = async (req, res) => {
    try {
        const { studentId, teacherId } = req.params;

        let payments;
        if (teacherId) {
            payments = await paymentService.getPaymentsByTeacher(teacherId);
        } else {
            payments = await paymentService.getPaymentsByStudent(studentId);
        }

        res.json({ 
            ok: true, 
            payments
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
