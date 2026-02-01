import supabase from '../config/supabase.js';
import { InvoiceService } from '../services/invoiceService.js';
import { generateInvoicePdfBuffer } from '../utils/pdf.js';
import { sendInvoiceEmail } from '../utils/email.js';

const service = new InvoiceService();

export const generateInvoice = async (req, res) => {
    try {
        const { studentId, month, items } = req.body || {};
        if (!studentId) return res.status(400).json({ error: 'studentId es requerido' });
        if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items es requerido' });
        // Validar importes
        const invalid = items.some((it) => Number(it?.amount) <= 0 || !it?.concept);
        if (invalid) return res.status(400).json({ error: 'Conceptos inválidos: monto > 0 y concepto requerido' });
        const createdBy = req.user?.internalId || null;

        const invoice = await service.createInvoice({ studentId, month, items, createdBy });
        res.json({ ok: true, invoice });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { items, taxAmount, discountAmount } = req.body || {};
        if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items es requerido' });
        const invoice = await service.updateInvoice(id, { items, taxAmount, discountAmount });
        res.json({ ok: true, invoice });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const cancelInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body || {};
        const invoice = await service.cancelInvoice(id, reason || 'Sin motivo especificado');
        res.json({ ok: true, invoice });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getInvoicePdf = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await service.getInvoiceById(id);
        // Optional student details for nicer PDF
        let student = null;
        try {
            const { data } = await supabase
                .from('student')
                .select('StudentID, FirstName, LastName')
                .eq('StudentID', invoice.ReferenceID)
                .single();
            student = data;
        } catch {}

        const pdfBuffer = await generateInvoicePdfBuffer(invoice, student);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.InvoiceNumber}.pdf"`);
        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const sendInvoiceEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await service.getInvoiceById(id);

        // Find primary guardian email
        const { data: link } = await supabase
            .from('student_guardian')
            .select('GuardianID, IsPrimary')
            .eq('StudentID', invoice.ReferenceID)
            .order('IsPrimary', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!link) return res.status(400).json({ error: 'Estudiante sin guardián asociado' });

        const { data: guardian } = await supabase
            .from('guardian')
            .select('Email, FirstName, LastName')
            .eq('GuardianID', link.GuardianID)
            .single();

        if (!guardian?.Email) return res.status(400).json({ error: 'El guardián no tiene email registrado' });

        // Generate PDF
        const pdfBuffer = await generateInvoicePdfBuffer(invoice, null);

        // Send email
        const subject = `Factura ${invoice.InvoiceNumber} - NiceKids`;
        const html = `<p>Estimado/a ${guardian.FirstName || ''} ${guardian.LastName || ''},</p>
                      <p>Adjuntamos la factura <b>${invoice.InvoiceNumber}</b> correspondiente.</p>
                      <p>Estado: ${invoice.Status} | Total: $${Number(invoice.FinalAmount || invoice.TotalAmount || 0).toFixed(2)}</p>
                      <p>Saludos,<br/>NiceKids Daycare</p>`;

        await sendInvoiceEmail({
            to: guardian.Email,
            subject,
            html,
            attachmentBuffer: pdfBuffer,
            filename: `invoice-${invoice.InvoiceNumber}.pdf`,
        });

        res.json({ ok: true, message: 'Factura enviada por email' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
