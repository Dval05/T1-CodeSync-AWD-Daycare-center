import supabase from '../config/supabase.js';

export class AttendanceRepository {
    async findByDateRange(from, to, studentId = null) {
        let query = supabase
            .from('attendance')
            .select('AttendanceID, Date, Status, IsLate, student:StudentID(FirstName, LastName, GradeID)')
            .order('Date', { ascending: true });

        if (from) query = query.gte('Date', from);
        if (to) query = query.lte('Date', to);
        if (studentId) query = query.eq('StudentID', studentId);

        const { data, error } = await query;
        if (error) throw error;

        return data;
    }
}

export const attendanceRepository = new AttendanceRepository();
