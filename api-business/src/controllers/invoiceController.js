import { InvoiceService } from '../services/InvoiceService.js';
import supabase from '../config/supabase.js';
import { PDFGenerator } from '../utils/PDFGenerator.js';

const invoiceService = new InvoiceService();

export const getInvoicePdf = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Se requiere id de factura' });

        const invoice = await invoiceService.getInvoiceById(id);

        
        const studentId = invoice.ReferenceID || invoice.StudentID;
        let student = null;
        if (studentId) {
            const { data: s } = await supabase
                .from('student')
                .select('StudentID, FirstName, LastName')
                .eq('StudentID', studentId)
                .maybeSingle();
            student = s;
        }

        
        const generator = new PDFGenerator();
        const doc = generator.createDocument();
        const fileName = `factura-${invoice.InvoiceNumber || invoice.InvoiceID}.pdf`;
        generator.setResponseHeaders(res, fileName);
        doc.pipe(res);

        
        generator.addTitle('Factura', `Factura #: ${invoice.InvoiceNumber || invoice.InvoiceID}`);

        
        const issueDate = invoice.IssueDate || invoice.InvoiceDate || '-';
        const dueDate = invoice.DueDate || '-';
        const studentLabel = student
            ? `${student.FirstName || ''} ${student.LastName || ''} (ID ${student.StudentID})`
            : (studentId ? `ID ${studentId}` : '-');
        const status = invoice.Status || 'Issued';
        generator.addSection('Información', [
            `Fecha de emisión: ${formatDate(issueDate)}`,
            `Fecha de vencimiento: ${formatDate(dueDate)}`,
            `Estudiante: ${studentLabel}`,
            `Estado: ${mapStatus(status)}`,
        ]);

        
        let items = [];
        try {
            if (invoice.Description) {
                const parsed = JSON.parse(invoice.Description);
                if (Array.isArray(parsed.items)) {
                    items = parsed.items.map(it => ({
                        concept: String(it.concept || 'Concepto'),
                        amount: Number(it.amount || 0),
                    }));
                }
            }
        } catch (_) {
            
        }

        if (items.length > 0) {
            const headers = ['Concepto', 'Monto'];
            const columnPositions = [50, 400];
            const rows = items.map(it => [it.concept, `$${it.amount.toFixed(2)}`]);
            generator.addSection('Detalle de Conceptos', '');
            generator.addTable(headers, rows, columnPositions);
        }

        // Totales
        const subtotal = Number(invoice.TotalAmount || 0);
        const tax = Number(invoice.TaxAmount || 0);
        const discount = Number(invoice.DiscountAmount || 0);
        const total = Number(invoice.FinalAmount || invoice.TotalAmount || 0);
        generator.addSection('Resumen de Pago', [
            `Subtotal: $${subtotal.toFixed(2)}`,
            `Impuestos: $${tax.toFixed(2)}`,
            `Descuentos: $${discount.toFixed(2)}`,
            `Total a pagar: $${total.toFixed(2)}`,
        ]);

        generator.addFooter(`Generado el ${new Date().toLocaleString('es-ES')}`);
        generator.finalize();
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
        case 'Paid': return 'Pagada';
        case 'Canceled': return 'Anulada';
        case 'Overdue': return 'Vencida';
        case 'Issued': return 'Emitida';
        default: return s;
    }
}
