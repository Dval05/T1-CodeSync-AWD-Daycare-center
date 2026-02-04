import supabase from '../config/supabase.js';

export const getMyActivities = async (req, res) => {
    const { guardianId, empId } = req.user;
    
    try {
        let dbRequest = supabase
            .from('activity')
            .select('*, grade:GradeID(GradeName)')
            .eq('IsActive', 1)
            .order('ScheduledDate', { ascending: false });

        

        
        if (guardianId && !empId) {
            
            
            const { data: relations } = await supabase
                .from('student_guardian')
                .select('StudentID')
                .eq('GuardianID', guardianId);
            
            const studentIds = (relations || []).map(r => r.StudentID);

            if (studentIds.length === 0) {
                return res.json([]); 
            }

            
            const { data: students } = await supabase
                .from('student')
                .select('GradeID')
                .in('StudentID', studentIds)
                .eq('IsActive', 1);

            const gradeIds = (students || []).map(s => s.GradeID).filter(Boolean);

            
            if (gradeIds.length > 0) {
                dbRequest = dbRequest.in('GradeID', gradeIds);
            } else {
                return res.json([]);
            }
        } 
        
        
        

        const { data, error } = await dbRequest;
        if (error) throw error;
        
        res.json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};