import supabase from '../config/supabase.js';

export const getMyActivities = async (req, res) => {
    const { guardianId, empId } = req.user;
    
    try {
        let dbRequest = supabase
            .from('activity')
            .select('*, grade:GradeID(GradeName)')
            .eq('IsActive', 1)
            .order('ScheduledDate', { ascending: false });

        // LÓGICA POR CONTEXTO (No por nombre de Rol)

        // CASO 1: Es un Guardián (tiene guardianId) y no es empleado
        if (guardianId && !empId) {
            
            // 1. Obtener hijos
            const { data: relations } = await supabase
                .from('student_guardian')
                .select('StudentID')
                .eq('GuardianID', guardianId);
            
            const studentIds = (relations || []).map(r => r.StudentID);

            if (studentIds.length === 0) {
                return res.json([]); 
            }

            // 2. Obtener grados de los hijos
            const { data: students } = await supabase
                .from('student')
                .select('GradeID')
                .in('StudentID', studentIds)
                .eq('IsActive', 1);

            const gradeIds = (students || []).map(s => s.GradeID).filter(Boolean);

            // 3. Filtrar actividades
            if (gradeIds.length > 0) {
                dbRequest = dbRequest.in('GradeID', gradeIds);
            } else {
                return res.json([]);
            }
        } 
        
        // CASO 2: Empleados / Admin
        // Por defecto ven todo (o puedes agregar filtros por creador aquí)

        const { data, error } = await dbRequest;
        if (error) throw error;
        
        res.json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};