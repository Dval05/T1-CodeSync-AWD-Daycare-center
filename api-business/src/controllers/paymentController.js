import { InvoiceService } from '../services/InvoiceService.js';
import { PaymentService } from '../services/PaymentService.js';

const invoiceService = new InvoiceService();
const paymentService = new PaymentService();

export const generateInvoice = async (req, res) => {
    try {
        const { studentId, teacherId, paymentData, items, month } = req.body;

        
        let payload = paymentData;
        if (!payload && Array.isArray(items)) {
            const subtotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
            if (subtotal <= 0 || items.some(it => !it.concept || Number(it.amount) <= 0)) {
                return res.status(400).json({ error: 'Conceptos inválidos: monto > 0 y concepto requerido' });
            }
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

        if ((!studentId && !teacherId) || !payload) {
            return res.status(400).json({ 
                error: 'Se requiere studentId o teacherId y paymentData/items' 
            });
        }

        const createdBy = req.user?.internalId || req.user?.userId || null;
        const referenceType = teacherId ? 'Teacher' : 'Student';
        const referenceId = teacherId || studentId;
        const invoice = await invoiceService.generateInvoice(referenceType, referenceId, payload, createdBy);

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
        
        let updatedPayment = null;
        try {
            const existingTeacherPayment = await paymentService.getTeacherPaymentById(id).catch(() => null);
            if (existingTeacherPayment) {
                
                updatedPayment = await paymentService.updateTeacherPayment(id, updateData);

                
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
                        
                        if (invoice?.InvoiceNumber) {
                            await paymentService.updateTeacherPayment(updatedPayment.TeacherPaymentID, { TransactionReference: invoice.InvoiceNumber }).catch(() => null);
                            
                            updatedPayment = await paymentService.getTeacherPaymentById(id).catch(() => updatedPayment);
                        }
                    } catch (err) {
                        console.warn('Error generating invoice after payment update:', err.message);
                    }
                }
            } else {
                
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


export const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        
        let deleted = null;
        try {
            const existing = await paymentService.getPaymentById(id).catch(() => null);
            if (existing) {
                const { data, error } = await (await import('../config/supabase.js')).default
                    .from('student_payment')
                    .delete()
                    .eq('StudentPaymentID', id)
                    .select()
                    .single();
                if (error) throw error;
                deleted = data;
            }
        } catch (_) {}

        if (!deleted) {
            const existingTeacher = await paymentService.getTeacherPaymentById(id).catch(() => null);
            if (existingTeacher) {
                const { data, error } = await (await import('../config/supabase.js')).default
                    .from('teacher_payment')
                    .delete()
                    .eq('TeacherPaymentID', id)
                    .select()
                    .single();
                if (error) throw error;
                deleted = data;
            }
        }

        if (!deleted) return res.status(404).json({ error: 'Pago no encontrado' });
        res.json({ ok: true, payment: deleted });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const listPayments = async (req, res) => {
    try {
        const { referenceType = 'Student', referenceId, status, from, to, search, limit = 50 } = req.query;
        const supabase = (await import('../config/supabase.js')).default;

        const isTeacher = String(referenceType).toLowerCase() === 'teacher';
        const table = isTeacher ? 'teacher_payment' : 'student_payment';
        let query = supabase.from(table).select('*').order('PaymentDate', { ascending: false }).limit(Number(limit));

        if (referenceId) query = query.eq(isTeacher ? 'EmpID' : 'StudentID', referenceId);
        if (status) query = query.eq('Status', status);
        if (from) query = query.gte('PaymentDate', from);
        if (to) query = query.lte('PaymentDate', to);
        if (search) {
            
            query = query.or(`InvoiceNumber.ilike.%${search}%,TransactionReference.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        res.json({ ok: true, data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPaymentPdf = async (req, res) => {
    try {
        const { id } = req.params;
        const supabase = (await import('../config/supabase.js')).default;
        const { PDFGenerator } = await import('../utils/PDFGenerator.js');

        
        let payment = await paymentService.getPaymentById(id).catch(() => null);
        let isTeacher = false;
        if (!payment) {
            payment = await paymentService.getTeacherPaymentById(id).catch(() => null);
            isTeacher = !!payment;
        }
        if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });

        const docGen = new PDFGenerator();
        const doc = docGen.createDocument();
        const fileName = `recibo-pago-${id}.pdf`;
        docGen.setResponseHeaders(res, fileName);
        doc.pipe(res);

        const title = 'Recibo de Pago';
        const subtitle = isTeacher ? `Profesor ID: ${payment.EmpID}` : `Estudiante ID: ${payment.StudentID}`;
        docGen.addTitle(title, subtitle);

        const status = payment.Status || 'Pending';
        const amount = Number(payment.TotalAmount || 0);
        const paidAmount = Number(payment.PaidAmount || amount);
        const balance = isTeacher ? null : (amount - paidAmount);
        const lines = [
            `Fecha de pago: ${formatDate(payment.PaymentDate)}`,
            `Método: ${payment.PaymentMethod || '-'}`,
            `Monto total: $${amount.toFixed(2)}`,
            `Monto pagado: $${paidAmount.toFixed(2)}`,
            ...(balance !== null ? [`Balance restante: $${Number(balance).toFixed(2)}`] : []),
            `Estado: ${mapStatus(status)}`,
            `Referencia: ${payment.TransactionReference || payment.InvoiceNumber || '-'}`,
        ];
        docGen.addSection('Detalle', lines);

        
        if (payment.Notes) docGen.addSection('Notas', payment.Notes);

        docGen.addFooter(`Generado el ${new Date().toLocaleString('es-ES')}`);
        docGen.finalize();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const emailPaymentReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        
        
        res.json({ ok: true, message: `Recibo de pago ${id} preparado para envío por email` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

function formatDate(d) {
    try {
        if (!d || d === '-') return '-';
        return new Date(d).toLocaleDateString('es-ES');
    } catch (_) {
        return String(d);
    }
}

function mapStatus(s) {
    switch (s) {
        case 'Paid': return 'Pagado';
        case 'Canceled': return 'Anulado';
        case 'Overdue': return 'Vencido';
        case 'Partial': return 'Parcial';
        case 'Pending': return 'Pendiente';
        default: return s;
    }
}
