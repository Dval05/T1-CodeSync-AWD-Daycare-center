import PDFDocument from 'pdfkit';

export async function generateInvoicePdfBuffer(invoice, student) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // Header
            doc.fontSize(20).text('NiceKids Daycare', { align: 'left' });
            doc.moveDown(0.3);
            doc.fontSize(10).fillColor('#666').text('Factura', { align: 'left' });
            doc.moveDown(1);

            // Invoice info
            doc.fillColor('#000').fontSize(12);
            doc.text(`Factura #: ${invoice.InvoiceNumber}`);
            doc.text(`Fecha: ${invoice.IssueDate}`);
            doc.text(`Vence: ${invoice.DueDate || '-'}`);
            doc.moveDown(0.5);

            // Student
            if (student) {
                doc.text(`Estudiante ID: ${student.StudentID || invoice.ReferenceID}`);
                if (student.FirstName) doc.text(`Nombre: ${student.FirstName} ${student.LastName || ''}`);
            } else {
                doc.text(`Estudiante ID: ${invoice.ReferenceID}`);
            }
            doc.moveDown(1);

            // Items
            let items = [];
            try {
                const parsed = invoice.Description ? JSON.parse(invoice.Description) : {};
                items = parsed.items || [];
            } catch {}

            doc.fontSize(12).text('Detalle', { underline: true });
            doc.moveDown(0.5);
            if (items.length === 0) {
                doc.text('Sin conceptos.');
            } else {
                items.forEach((it) => {
                    doc.text(`- ${it.concept || 'Concepto'}: $${Number(it.amount || 0).toFixed(2)}`);
                });
            }
            doc.moveDown(1);

            // Totals
            doc.fontSize(12).text(`Subtotal: $${Number(invoice.TotalAmount || invoice.FinalAmount || 0).toFixed(2)}`);
            doc.text(`Impuestos: $${Number(invoice.TaxAmount || 0).toFixed(2)}`);
            doc.text(`Descuentos: $${Number(invoice.DiscountAmount || 0).toFixed(2)}`);
            doc.fontSize(14).text(`Total: $${Number(invoice.FinalAmount || invoice.TotalAmount || 0).toFixed(2)}`, { align: 'right' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}
