import supabase from '../config/supabase.js';

export const getAttendanceReport = async (req, res) => {
    const { from, to } = req.query;
    try {
        let dbRequest = supabase
            .from('attendance')
            .select('AttendanceID, Date, Status, IsLate, student:StudentID(FirstName, LastName, GradeID)')
            .order('Date', { ascending: true });

        if (from) dbRequest = dbRequest.gte('Date', from);
        if (to) dbRequest = dbRequest.lte('Date', to);

        const { data: records, error } = await dbRequest;
        if (error) throw error;

        const stats = {
            total: records.length,
            present: records.filter(r => r.Status === 'Present').length,
            absent: records.filter(r => r.Status === 'Absent').length,
            late: records.filter(r => r.IsLate === 1).length
        };

        res.json({ stats, records });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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