import supabase from '../config/supabase.js';

export const getStudentBalance = async (req, res) => {
    const { id } = req.params; 
    
    if (req.user.guardianId) {
        const { data: link } = await supabase.from('student_guardian')
            .select('StudentGuardianID')
            .eq('GuardianID', req.user.guardianId)
            .eq('StudentID', id)
            .single();
        
        if (!link) return res.status(403).json({ error: 'No autorizado.' });
    }

    try {
        const { data: payments, error } = await supabase
            .from('student_payment')
            .select('TotalAmount, PaidAmount')
            .eq('StudentID', id)
           

        if (error) throw error;

        const totalDue = payments.reduce((sum, p) => sum + (Number(p.TotalAmount) || 0), 0);
        const totalPaid = payments.reduce((sum, p) => sum + (Number(p.PaidAmount) || 0), 0);
        const balance = totalDue - totalPaid;

        res.json({ studentId: id, summary: { totalDue, totalPaid, balance } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getTeacherBalance = async (req, res) => {
    const { id } = req.params; 

    try {
        const { data: payments, error } = await supabase
            .from('teacher_payment')
            .select('TotalAmount, PaidAmount')
            .eq('TeacherID', id);

        if (error) throw error;

        const totalDue = payments.reduce((sum, p) => sum + (Number(p.TotalAmount) || 0), 0);
        const totalPaid = payments.reduce((sum, p) => sum + (Number(p.PaidAmount) || 0), 0);
        const balance = totalDue - totalPaid;

        res.json({ teacherId: id, summary: { totalDue, totalPaid, balance } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const exportTeacherPaymentsCsv = async (req, res) => {
    try {
        const { id } = req.params; 
        const { from, to, status, month } = req.query;
        let q = supabase
            .from('teacher_payment')
            .select('*')
            .eq('EmpID', id)
            .order('PaymentDate', { ascending: false });
        if (status) q = q.eq('Status', status);
        if (from) q = q.gte('PaymentDate', from);
        if (to) q = q.lte('PaymentDate', to);
        if (month) q = q.eq('PaymentPeriod', month);
        const { data, error } = await q;
        if (error) throw error;
        const items = Array.isArray(data) ? data : [];
        const header = ['TeacherPaymentID','EmpID','PaymentPeriod','BaseSalary','Bonuses','Overtime','Deductions','TotalAmount','Status','PaymentDate','PaymentMethod','TransactionReference'];
        const rows = items.map(p => [
            p.TeacherPaymentID,
            p.EmpID,
            p.PaymentPeriod || '',
            Number(p.BaseSalary || 0).toFixed(2),
            Number(p.Bonuses || 0).toFixed(2),
            Number(p.Overtime || 0).toFixed(2),
            Number(p.Deductions || 0).toFixed(2),
            Number(p.TotalAmount || 0).toFixed(2),
            p.Status || 'Pending',
            p.PaymentDate || '',
            p.PaymentMethod || '',
            p.TransactionReference || ''
        ].join(','));
        const csv = [header.join(','), ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="teacher-payments-${id}.csv"`);
        res.send(csv);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getTeacherPayrollPdf = async (req, res) => {
    try {
        const { id } = req.params; 
        const { month, from, to } = req.query;
        let q = supabase
            .from('teacher_payment')
            .select('*')
            .eq('EmpID', id)
            .order('PaymentDate', { ascending: true });
        if (month) q = q.eq('PaymentPeriod', month);
        if (from) q = q.gte('PaymentDate', from);
        if (to) q = q.lte('PaymentDate', to);
        const { data, error } = await q;
        if (error) throw error;
        const items = Array.isArray(data) ? data : [];

        const { PDFGenerator } = await import('../utils/PDFGenerator.js');
        const docGen = new PDFGenerator();
        const doc = docGen.createDocument();
        const fileName = `nomina-profesor-${id}-${month || `${from || ''}_${to || ''}`}.pdf`;
        docGen.setResponseHeaders(res, fileName);
        doc.pipe(res);

        docGen.addTitle('Resumen de Nómina', `Profesor ID: ${id}${month ? ` | Periodo: ${month}` : ''}`);

        const totals = items.reduce((acc, p) => {
            acc.base += Number(p.BaseSalary || 0);
            acc.bonuses += Number(p.Bonuses || 0);
            acc.overtime += Number(p.Overtime || 0);
            acc.deductions += Number(p.Deductions || 0);
            acc.total += Number(p.TotalAmount || 0);
            return acc;
        }, { base: 0, bonuses: 0, overtime: 0, deductions: 0, total: 0 });

        docGen.addSection('Totales', [
            `Salario base: $${totals.base.toFixed(2)}`,
            `Bonificaciones: $${totals.bonuses.toFixed(2)}`,
            `Horas extra: $${totals.overtime.toFixed(2)}`,
            `Deducciones: -$${totals.deductions.toFixed(2)}`,
            `Total a pagar: $${totals.total.toFixed(2)}`
        ]);

        const headers = ['Periodo', 'Fecha', 'Concepto', 'Monto', 'Estado'];
        const rows = items.map(p => [
            p.PaymentPeriod || '-',
            formatDate(p.PaymentDate),
            buildConcept(p),
            `$${Number(p.TotalAmount || (Number(p.BaseSalary||0)+Number(p.Bonuses||0)+Number(p.Overtime||0)-Number(p.Deductions||0))).toFixed(2)}`,
            mapStatus(p.Status)
        ]);
        const cols = [50, 180, 270, 430, 500];
        docGen.addTable(headers, rows, cols);

        docGen.addFooter(`Generado el ${new Date().toLocaleString('es-ES')}`);
        docGen.finalize();
    } catch (err) {
        res.status(500).json({ error: err.message });
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

function buildConcept(p) {
    const parts = [];
    const add = (label, val) => { const n = Number(val || 0); if (n) parts.push(`${label}: $${n.toFixed(2)}`); };
    add('Base', p.BaseSalary);
    add('Bonos', p.Bonuses);
    add('Extra', p.Overtime);
    add('Deducciones', -Number(p.Deductions || 0));
    return parts.length ? parts.join(' | ') : 'Pago';
}