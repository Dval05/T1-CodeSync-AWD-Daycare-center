import PDFDocument from 'pdfkit';

export class PDFGenerator {
    constructor() {
        this.doc = null;
    }

    createDocument() {
        this.doc = new PDFDocument({ margin: 50 });
        return this.doc;
    }

    setResponseHeaders(res, filename) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    }

    addTitle(title, subtitle = null) {
        this.doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
        this.doc.moveDown(0.5);
        
        if (subtitle) {
            this.doc.fontSize(12).font('Helvetica').text(subtitle, { align: 'center' });
        }
        
        this.doc.moveDown(2);
    }

    addSection(title, content) {
        this.doc.fontSize(14).font('Helvetica-Bold').text(title, { underline: true });
        this.doc.moveDown(0.5);
        this.doc.fontSize(11).font('Helvetica');
        
        if (Array.isArray(content)) {
            content.forEach(line => this.doc.text(line));
        } else {
            this.doc.text(content);
        }
        
        this.doc.moveDown(2);
    }

    addTable(headers, rows, columnPositions) {
        const tableTop = this.doc.y;
        
        this.doc.fontSize(10).font('Helvetica-Bold');
        headers.forEach((header, i) => {
            this.doc.text(header, columnPositions[i], tableTop);
        });

        this.doc.moveTo(50, this.doc.y + 5).lineTo(550, this.doc.y + 5).stroke();
        this.doc.moveDown(0.5);

        this.doc.font('Helvetica').fontSize(9);
        rows.forEach(row => {
            const y = this.doc.y;
            
            if (y > 720) {
                this.doc.addPage();
                this.doc.y = 50;
            }

            row.forEach((cell, i) => {
                this.doc.text(cell, columnPositions[i], y, { width: 180 });
            });
            
            this.doc.moveDown(0.8);
        });
    }

    addFooter(text) {
        this.doc.moveDown(2);
        this.doc.fontSize(8).font('Helvetica-Oblique').text(text, { align: 'center' });
    }

    finalize() {
        this.doc.end();
    }
}
