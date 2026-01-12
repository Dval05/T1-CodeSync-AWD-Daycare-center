import supabase from '../config/supabase.js';

export const getStudentBalance = async (req, res) => {
    const { id } = req.params; // StudentID
    
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
           // .neq('Status', 'Canceled');

        if (error) throw error;

        const totalDue = payments.reduce((sum, p) => sum + (Number(p.TotalAmount) || 0), 0);
        const totalPaid = payments.reduce((sum, p) => sum + (Number(p.PaidAmount) || 0), 0);
        const balance = totalDue - totalPaid;

        res.json({ studentId: id, summary: { totalDue, totalPaid, balance } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};