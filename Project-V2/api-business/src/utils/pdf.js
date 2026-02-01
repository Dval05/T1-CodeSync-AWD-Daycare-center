import PDFDocument from 'pdfkit';

function currency(n) {
    return `$${Number(n || 0).toFixed(2)}`;
}

export async function generateInvoicePdfBuffer(invoice, student) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            const pageWidth = doc.page.width;
            const margin = 50;
            const contentWidth = pageWidth - margin * 2;
            const leftX = margin;
            const rightX = margin + contentWidth;

            // Title
            doc.font('Helvetica-Bold').fontSize(20).text('Factura', { align: 'center' });
            doc.moveDown(0.5);
            doc.font('Helvetica').fontSize(11).text(`Factura #: ${invoice.InvoiceNumber}`, { align: 'center' });
            doc.moveDown(1.2);

            // Información
            doc.font('Helvetica-Bold').fontSize(12).text('Información');
            doc.moveDown(0.2);
            doc.strokeColor('#aaa').moveTo(leftX, doc.y).lineTo(rightX, doc.y).stroke();
            doc.moveDown(0.5);

            const issue = invoice.IssueDate || '-';
            const due = invoice.DueDate || '-';
            const studentLabel = student
                ? `${student.FirstName || ''} ${student.LastName || ''}`.trim()
                : '';
            const studentId = student?.StudentID || invoice.ReferenceID || '-';
            const status = invoice.Status || 'Emitida';

            doc.font('Helvetica').fontSize(11);
            doc.text(`Fecha de emisión: ${issue}`);
            doc.text(`Fecha de vencimiento: ${due}`);
            doc.text(`Estudiante: ${studentLabel ? `${studentLabel} (ID ${studentId})` : `ID ${studentId}`}`);
            doc.text(`Estado: ${status}`);
            doc.moveDown(1.2);

            // Detalle de Conceptos (tabla)
            doc.font('Helvetica-Bold').text('Detalle de Conceptos');
            doc.moveDown(0.2);
            doc.strokeColor('#aaa').moveTo(leftX, doc.y).lineTo(rightX, doc.y).stroke();
            doc.moveDown(0.5);

            let items = [];
            try {
                const parsed = invoice.Description ? JSON.parse(invoice.Description) : {};
                items = Array.isArray(parsed.items) ? parsed.items : [];
            } catch {}

            const conceptColWidth = contentWidth - 140; // leave room for amount column
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

            // Resumen de Pago
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
            const labelWidth = conceptColWidth; // reuse for alignment
            const labelX = leftX + conceptColWidth - 10; // slight padding
            const valueX = leftX + conceptColWidth;

            function summaryRow(label, value) {
                const y = doc.y;
                doc.text(label, labelX, y, { width: labelWidth, align: 'right' });
                doc.text(value, valueX, y, { width: summaryWidth, align: 'right' });
                doc.moveDown(0.2);
            }

            summaryRow('Subtotal:', currency(subtotal));
            summaryRow('Impuestos:', currency(taxes));
            summaryRow('Descuentos:', currency(discounts));
            doc.moveDown(0.2);
            doc.font('Helvetica-Bold');
            summaryRow('Total a pagar:', currency(total));
            doc.font('Helvetica');

            // Footer
            doc.moveDown(1.5);
            doc.fontSize(8).fillColor('#666').text(`Generado el ${new Date().toLocaleString('es-ES')}`, { align: 'right' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}
