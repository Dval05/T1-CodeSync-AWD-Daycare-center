import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

async function loadJSPDFUMD() {
    if (window.jspdf && window.jspdf.jsPDF && window.jspdfAutoTableLoaded) return;
    // Cargar jsPDF UMD
    if (!window.jspdf || !window.jspdf.jsPDF) {
        await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
            s.onload = () => res();
            s.onerror = () => rej(new Error('No se pudo cargar jsPDF'));
            document.head.appendChild(s);
        });
    }
    // Cargar autotable UMD (adjunta autoTable a jsPDF)
    if (!window.jspdfAutoTableLoaded) {
        await new Promise((res, rej) => {
            const s2 = document.createElement('script');
            s2.src = 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.28/dist/jspdf.plugin.autotable.min.js';
            s2.onload = () => {
                window.jspdfAutoTableLoaded = true;
                res();
            };
            s2.onerror = () => rej(new Error('No se pudo cargar jspdf-autotable'));
            document.head.appendChild(s2);
        });
    }
}

// Genera un reporte de asistencia en PDF. Requiere que las asistencias
// para los estudiantes mostrados ya estén guardadas en la tabla 'attendance'.
export async function generateAttendanceReport() {
    const dateInput = document.querySelector('#attDate');
    const gradeSelect = document.querySelector('#gradeFilter');
    if (!dateInput || !dateInput.value) return showToast({ title: 'Fecha requerida', message: 'Seleccione una fecha', type: 'warning' });
    if (!gradeSelect || !gradeSelect.value) return showToast({ title: 'Grado requerido', message: 'Seleccione un grado', type: 'warning' });

    const date = dateInput.value;
    const gradeId = parseInt(gradeSelect.value, 10);

    // Recolectar estudiantes visibles en la tabla
    const rows = Array.from(document.querySelectorAll('#attTableBody tr'));
    if (!rows.length) return showToast({ title: 'Sin estudiantes', message: 'No hay estudiantes para generar el reporte', type: 'warning' });

    const studentIds = rows.map(r => parseInt(r.getAttribute('data-student-id'), 10)).filter(Boolean);
    if (!studentIds.length) return showToast({ title: 'Sin estudiantes', message: 'No hay estudiantes para generar el reporte', type: 'warning' });

    // Traer asistencias guardadas para esos estudiantes y esa fecha
    const { data: attData, error: attErr } = await supabase
        .from('attendance')
        .select('AttendanceID, StudentID, Status, CheckInTime, CheckOutTime')
        .in('StudentID', studentIds)
        .eq('Date', date);
    if (attErr) return showToast({ title: 'Error', message: attErr.message, type: 'error' });

    const attMap = new Map((attData || []).map(a => [a.StudentID, a]));
    const missing = studentIds.filter(id => !attMap.has(id));
    if (missing.length) {
        return showToast({ title: 'Asistencias pendientes', message: 'Guarde todas las asistencias antes de generar el reporte', type: 'warning' });
    }

    // Preparar filas para el PDF: tomar nombre desde la tabla DOM
    const tableRows = rows.map(r => {
        const sid = parseInt(r.getAttribute('data-student-id'), 10);
        const nameCell = r.querySelector('td')?.textContent?.trim() || '';
        const att = attMap.get(sid) || {};
        return [
            nameCell,
            att.Status || '',
            att.CheckInTime || '',
            att.CheckOutTime || ''
        ];
    });

    // Recuperar nombre de grado para el archivo
    let gradeName = '';
    try {
        const { data: gdata } = await supabase.from('grade').select('GradeName').eq('GradeID', gradeId).maybeSingle();
        gradeName = gdata?.GradeName || gradeSelect.options[gradeSelect.selectedIndex]?.text || gradeId.toString();
    } catch (_) { gradeName = gradeSelect.options[gradeSelect.selectedIndex]?.text || gradeId.toString(); }

    // Cargar versiones UMD de jsPDF + autotable para evitar errores de resolución de módulos
    await loadJSPDFUMD();
    const jsPDF = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : (window.jsPDF || null);
    if (!jsPDF) return showToast({ title: 'Error', message: 'No se pudo cargar jsPDF', type: 'error' });
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const left = 14;
    doc.setFontSize(16);
    doc.text('NiceKids', left, 20);
    doc.setFontSize(10);
    const emitDate = new Date();
    const emitStr = `${String(emitDate.getDate()).padStart(2,'0')}/${String(emitDate.getMonth()+1).padStart(2,'0')}/${emitDate.getFullYear()}`;
    const attDate = `${String(new Date(date).getDate()).padStart(2,'0')}/${String(new Date(date).getMonth()+1).padStart(2,'0')}/${new Date(date).getFullYear()}`;
    doc.text(`Fecha emisión del reporte: ${emitStr}`, left, 28);
    doc.text(`Fecha de asistencia: ${attDate}`, left, 34);
    doc.text(`Grado: ${gradeName}`, left, 40);

    doc.autoTable({
    startY: 48,
    head: [['Estudiante', 'Estado', 'Hora de Entrada', 'Hora de Salida']],
    body: tableRows,
    styles: { fontSize: 10 },
    headStyles: { 
        fillColor: [0, 0, 0],     // Fondo negro
        textColor: [255, 255, 255] // Texto blanco
    }
});


    const filename = `NiceKids_Asistencia_${gradeName.replace(/\s+/g,'_')}_${date}.pdf`;
    doc.save(filename);
    showToast({ title: 'Reporte generado', message: `Archivo: ${filename}`, type: 'success' });
}
