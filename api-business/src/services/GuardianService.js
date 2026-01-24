import supabase from '../config/supabase.js';

export class GuardianService {
    async getGuardianStudents(guardianId) {
        const { data: links, error: linkError } = await supabase
            .from('student_guardian')
            .select('StudentID, Relationship, IsPrimary')
            .eq('GuardianID', guardianId);

        if (linkError) throw linkError;

        const studentIds = links.map(link => link.StudentID);

        if (studentIds.length === 0) {
            return [];
        }

        const { data: students, error: studentsError } = await supabase
            .from('student')
            .select('StudentID, FirstName, LastName, BirthDate, GradeID, ProfilePicture, IsActive, grade:GradeID(GradeName)')
            .in('StudentID', studentIds)
            .eq('IsActive', 1)
            .order('FirstName');

        if (studentsError) throw studentsError;

        return students.map(student => {
            const link = links.find(l => l.StudentID === student.StudentID);
            return {
                ...student,
                Relationship: link?.Relationship,
                IsPrimary: link?.IsPrimary
            };
        });
    }

    async getGuardianBalance(guardianId) {
        const students = await this.getGuardianStudents(guardianId);
        const studentIds = students.map(s => s.StudentID);

        if (studentIds.length === 0) {
            return {
                totalDue: 0,
                totalPaid: 0,
                balance: 0,
                students: []
            };
        }

        const { data: payments, error } = await supabase
            .from('student_payment')
            .select('StudentID, TotalAmount, PaidAmount, Status, DueDate')
            .in('StudentID', studentIds);

        if (error) throw error;

        const studentBalances = students.map(student => {
            const studentPayments = payments.filter(p => p.StudentID === student.StudentID);
            const totalDue = studentPayments.reduce((sum, p) => sum + (Number(p.TotalAmount) || 0), 0);
            const totalPaid = studentPayments.reduce((sum, p) => sum + (Number(p.PaidAmount) || 0), 0);
            
            return {
                studentId: student.StudentID,
                studentName: `${student.FirstName} ${student.LastName}`,
                totalDue,
                totalPaid,
                balance: totalDue - totalPaid
            };
        });

        const totalDue = studentBalances.reduce((sum, s) => sum + s.totalDue, 0);
        const totalPaid = studentBalances.reduce((sum, s) => sum + s.totalPaid, 0);

        return {
            totalDue,
            totalPaid,
            balance: totalDue - totalPaid,
            students: studentBalances
        };
    }

    async getGuardianById(guardianId) {
        const { data, error } = await supabase
            .from('guardian')
            .select('*')
            .eq('GuardianID', guardianId)
            .eq('IsActive', 1)
            .single();

        if (error) throw error;
        return data;
    }
}
