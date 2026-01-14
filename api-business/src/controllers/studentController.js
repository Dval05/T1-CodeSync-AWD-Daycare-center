import supabase from '../config/supabase.js';
import { calculateAge, daysUntilBirthday } from '../utils/studentCalculations.js';

export const fastIntake = async (req, res) => {
    const { student, guardian } = req.body;
    
    try {
        // 1. Estudiante
        const { data: newStudent, error: sErr } = await supabase
            .from('student')
            .insert({ ...student, IsActive: 1 })
            .select('StudentID')
            .single();
        if (sErr) throw new Error(`Estudiante: ${sErr.message}`);

        // 2. Guardián
        if (guardian) {
            // Verificar si existe por documento
            const { data: existG } = await supabase.from('guardian').select('GuardianID').eq('DocumentNumber', guardian.DocumentNumber).maybeSingle();
            let guardianId = existG?.GuardianID;

            if (!guardianId) {
                const { data: newG, error: gErr } = await supabase
                    .from('guardian')
                    .insert({ ...guardian, IsActive: 1 })
                    .select('GuardianID')
                    .single();
                if (gErr) throw new Error(`Responsable: ${gErr.message}`);
                guardianId = newG.GuardianID;
            }

            // Vincular
            await supabase.from('student_guardian').insert({
                StudentID: newStudent.StudentID,
                GuardianID: guardianId,
                Relationship: guardian.relationship || 'Tutor',
                IsPrimary: 1
            });
        }

        res.json({ success: true, studentId: newStudent.StudentID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const canDeactivate = async (req, res) => {
    const { id } = req.params;
    try {
        const { count: debt } = await supabase.from('student_payment')
            .select('*', { count: 'exact', head: true })
            .eq('StudentID', id)
            .in('Status', ['Pending', 'Partial']);
        
        if (debt > 0) return res.json({ allowed: false, reason: 'Tiene pagos pendientes' });
        res.json({ allowed: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getStudentCalculations = async (req, res) => {
    const { id } = req.params;
    try {
        const { data } = await supabase.from('student').select('BirthDate').eq('StudentID', id).single();
        if (!data) return res.status(404).json({ error: 'No encontrado' });
        
        const age = data.BirthDate ? calculateAge(data.BirthDate) : null;
        const bday = data.BirthDate ? daysUntilBirthday(data.BirthDate) : null;
        res.json({ age, bday });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};