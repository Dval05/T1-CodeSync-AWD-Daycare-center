import { PDFGenerator } from './PDFGenerator.js';

export class AttendanceReportPDF {
    constructor(stats, records, filters) {
        this.stats = stats;
        this.records = records;
        this.filters = filters;
        this.generator = new PDFGenerator();
    }

    generate(res) {
        const doc = this.generator.createDocument();
        this.generator.setResponseHeaders(res, this.getFilename());
        
        doc.pipe(res);
        
        this.addHeader();
        this.addStatistics();
        this.addRecordsTable();
        this.addFooter();
        
        this.generator.finalize();
    }

    getFilename() {
        return `reporte-asistencia-${this.filters.from}-${this.filters.to}.pdf`;
    }

    addHeader() {
        this.generator.addTitle(
            'Reporte de Asistencias',
            `Periodo: ${this.filters.from} al ${this.filters.to}`
        );

        if (this.hasFilters()) {
            const filterText = this.getFilterDescription();
            this.generator.doc.fontSize(10).font('Helvetica-Oblique').text(filterText, { align: 'center' });
            this.generator.doc.moveDown(2);
        }
    }

    hasFilters() {
        return this.filters.studentId || this.filters.gradeId;
    }

    getFilterDescription() {
        const filters = [];
        if (this.filters.studentId) filters.push('Filtrado por estudiante seleccionado');
        if (this.filters.gradeId) filters.push('Filtrado por curso seleccionado');
        return filters.join(' - ');
    }

    addStatistics() {
        const percentage = (value) => 
            this.stats.total > 0 ? ((value / this.stats.total) * 100).toFixed(1) : 0;

        this.generator.addSection('Resumen Estadístico', [
            `Total de Registros: ${this.stats.total}`,
            `Presentes: ${this.stats.present} (${percentage(this.stats.present)}%)`,
            `Ausentes: ${this.stats.absent} (${percentage(this.stats.absent)}%)`,
            `Retardos: ${this.stats.late}`
        ]);
    }

    addRecordsTable() {
        this.generator.doc.fontSize(14).font('Helvetica-Bold').text('Detalle de Registros', { underline: true });
        this.generator.doc.moveDown(1);

        const headers = ['Fecha', 'Estudiante', 'Estado', 'Retardo'];
        const columnPositions = [50, 140, 330, 450];
        
        const rows = this.records.map(record => [
            this.formatDate(record.Date),
            this.getStudentName(record),
            record.Status === 'Present' ? 'Presente' : 'Ausente',
            record.IsLate ? 'Sí' : 'No'
        ]);

        this.generator.addTable(headers, rows, columnPositions);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES');
    }

    getStudentName(record) {
        const { student } = record;
        return `${student?.FirstName || ''} ${student?.LastName || ''}`;
    }

    addFooter() {
        const timestamp = new Date().toLocaleString('es-ES');
        this.generator.addFooter(`Generado el ${timestamp}`);
    }
}
