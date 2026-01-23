import supabase from '../config/supabase.js';
import PDFDocument from 'pdfkit';

export const getAttendanceReport = async (req, res) => {
    const { from, to, format, studentId, gradeId } = req.query;
    try {
        let dbRequest = supabase
            .from('attendance')
            .select('AttendanceID, Date, Status, IsLate, student:StudentID(FirstName, LastName, GradeID)')
            .order('Date', { ascending: true });

        if (from) dbRequest = dbRequest.gte('Date', from);
        if (to) dbRequest = dbRequest.lte('Date', to);
        if (studentId) dbRequest = dbRequest.eq('StudentID', studentId);

        const { data: records, error } = await dbRequest;
        if (error) throw error;

        // Filtrar por curso si se especifica (después de la consulta)
        let filteredRecords = records;
        if (gradeId) {
            filteredRecords = records.filter(r => r.student?.GradeID == gradeId);
        }

        const stats = {
            total: filteredRecords.length,
            present: filteredRecords.filter(r => r.Status === 'Present').length,
            absent: filteredRecords.filter(r => r.Status === 'Absent').length,
            late: filteredRecords.filter(r => r.IsLate === 1).length
        };

        // Si piden PDF, generar y retornar
        if (format === 'pdf') {
            return generateAttendancePDF(res, stats, filteredRecords, from, to, studentId, gradeId);
        }

        res.json({ stats, records: filteredRecords });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

function generateAttendancePDF(res, stats, records, from, to, studentId, gradeId) {
    const doc = new PDFDocument({ margin: 50 });

    // Headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-asistencia-${from}-${to}.pdf`);

    // Pipe al response
    doc.pipe(res);

    // Título
    doc.fontSize(20).font('Helvetica-Bold').text('Reporte de Asistencias', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Periodo: ${from} al ${to}`, { align: 'center' });
    
    // Mostrar filtros aplicados
    if (studentId || gradeId) {
        doc.fontSize(10).font('Helvetica-Oblique');
        if (studentId) doc.text('Filtrado por estudiante seleccionado', { align: 'center' });
        if (gradeId) doc.text('Filtrado por curso seleccionado', { align: 'center' });
    }
    
    doc.moveDown(2);

    // Estadísticas
    doc.fontSize(14).font('Helvetica-Bold').text('Resumen Estadístico', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total de Registros: ${stats.total}`);
    doc.text(`Presentes: ${stats.present} (${((stats.present / stats.total) * 100).toFixed(1)}%)`);
    doc.text(`Ausentes: ${stats.absent} (${((stats.absent / stats.total) * 100).toFixed(1)}%)`);
    doc.text(`Retardos: ${stats.late}`);
    doc.moveDown(2);

    // Tabla de registros
    doc.fontSize(14).font('Helvetica-Bold').text('Detalle de Registros', { underline: true });
    doc.moveDown(1);

    // Headers de tabla
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 140;
    const col3 = 330;
    const col4 = 450;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Fecha', col1, tableTop);
    doc.text('Estudiante', col2, tableTop);
    doc.text('Estado', col3, tableTop);
    doc.text('Retardo', col4, tableTop);

    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(0.5);

    // Datos
    doc.font('Helvetica').fontSize(9);
    records.forEach((record, i) => {
        const y = doc.y;
        
        // Si nos quedamos sin espacio, nueva página
        if (y > 720) {
            doc.addPage();
            doc.y = 50;
        }

        const fecha = new Date(record.Date).toLocaleDateString('es-ES');
        const estudiante = `${record.student?.FirstName || ''} ${record.student?.LastName || ''}`;
        const estado = record.Status === 'Present' ? 'Presente' : 'Ausente';
        const retardo = record.IsLate ? 'Sí' : 'No';

        doc.text(fecha, col1, doc.y);
        doc.text(estudiante, col2, y, { width: 180 });
        doc.text(estado, col3, y);
        doc.text(retardo, col4, y);
        
        doc.moveDown(0.8);
    });

    // Pie de página
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica-Oblique').text(
        `Generado el ${new Date().toLocaleString('es-ES')}`,
        { align: 'center' }
    );

    doc.end();
}

export const getStudentProgressReport = async (req, res) => {
    const { id } = req.params;
    const { from, to } = req.query;

    try {
        // Asistencia
        let attReq = supabase.from('attendance').select('Status, IsLate').eq('StudentID', id);
        if (from) attReq = attReq.gte('Date', from);
        if (to) attReq = attReq.lte('Date', to);
        const { data: attendance } = await attReq;

        // Observaciones
        let obsReq = supabase.from('student_observation').select('*').eq('StudentID', id).order('ObservationDate', {ascending: false});
        if (from) obsReq = obsReq.gte('ObservationDate', from);
        if (to) obsReq = obsReq.lte('ObservationDate', to);
        const { data: observations } = await obsReq;

        // Cálculos
        const total = attendance.length;
        const present = attendance.filter(r => r.Status === 'Present').length;
        const percentage = total ? ((present / total) * 100).toFixed(1) : 0;

        res.json({
            studentId: id,
            period: { from, to },
            attendance: { total, present, percentage },
            observations
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};