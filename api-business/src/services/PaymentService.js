import supabase from '../config/supabase.js';

export class PaymentService {
    async registerPayment(studentId, paymentData, processedBy) {
        const payment = {
            StudentID: studentId,
            ServiceType: paymentData.ServiceType || 'Monthly',
            Hours: paymentData.Hours || null,
            RatePerHour: paymentData.RatePerHour || null,
            MonthlyFee: paymentData.MonthlyFee || null,
            DailyFee: paymentData.DailyFee || null,
            TotalAmount: paymentData.TotalAmount,
            PaidAmount: paymentData.PaidAmount || 0,
            BalanceRemaining: this.calculateBalance(paymentData),
            PaymentDate: paymentData.PaymentDate || new Date().toISOString().split('T')[0],
            DueDate: paymentData.DueDate,
            PaymentMethod: paymentData.PaymentMethod,
            Status: this.determineStatus(paymentData),
            IsRecurrent: paymentData.IsRecurrent !== undefined ? paymentData.IsRecurrent : 1,
            StartDate: paymentData.StartDate || null,
            EndDate: paymentData.EndDate || null,
            InvoiceNumber: paymentData.InvoiceNumber || null,
            TransactionReference: paymentData.TransactionReference || null,
            Notes: paymentData.Notes || null,
            ProcessedBy: processedBy,
            CreatedBy: processedBy
        };

        const { data, error } = await supabase
            .from('student_payment')
            .insert(payment)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    calculateBalance(paymentData) {
        const total = Number(paymentData.TotalAmount) || 0;
        const paid = Number(paymentData.PaidAmount) || 0;
        return total - paid;
    }

    determineStatus(paymentData) {
        const total = Number(paymentData.TotalAmount) || 0;
        const paid = Number(paymentData.PaidAmount) || 0;

        if (paid === 0) return 'Pending';
        if (paid >= total) return 'Paid';
        return 'Partial';
    }

    async updatePayment(paymentId, updateData) {
        const updates = { ...updateData };
        
        if (updateData.PaidAmount !== undefined && updateData.TotalAmount !== undefined) {
            updates.BalanceRemaining = this.calculateBalance(updateData);
            updates.Status = this.determineStatus(updateData);
        }

        updates.UpdatedAt = new Date().toISOString();

        const { data, error } = await supabase
            .from('student_payment')
            .update(updates)
            .eq('StudentPaymentID', paymentId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getPaymentById(paymentId) {
        const { data, error } = await supabase
            .from('student_payment')
            .select('*')
            .eq('StudentPaymentID', paymentId)
            .single();

        if (error) throw error;
        return data;
    }

    async getPaymentsByStudent(studentId) {
        const { data, error } = await supabase
            .from('student_payment')
            .select('*')
            .eq('StudentID', studentId)
            .order('PaymentDate', { ascending: false });

        if (error) throw error;
        return data;
    }

    // Teacher payment methods
    async registerTeacherPayment(teacherId, paymentData, processedBy) {
        const payment = {
            TeacherID: teacherId,
            ServiceType: paymentData.ServiceType || 'Salary',
            Hours: paymentData.Hours || null,
            RatePerHour: paymentData.RatePerHour || null,
            TotalAmount: paymentData.TotalAmount,
            PaidAmount: paymentData.PaidAmount || 0,
            BalanceRemaining: this.calculateBalance(paymentData),
            PaymentDate: paymentData.PaymentDate || new Date().toISOString().split('T')[0],
            DueDate: paymentData.DueDate,
            PaymentMethod: paymentData.PaymentMethod,
            Status: this.determineStatus(paymentData),
            Notes: paymentData.Notes || null,
            ProcessedBy: processedBy,
            CreatedBy: processedBy
        };

        const { data, error } = await supabase
            .from('teacher_payment')
            .insert(payment)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateTeacherPayment(paymentId, updateData) {
        const updates = { ...updateData };
        if (updateData.PaidAmount !== undefined && updateData.TotalAmount !== undefined) {
            updates.BalanceRemaining = this.calculateBalance(updateData);
            updates.Status = this.determineStatus(updateData);
        }
        updates.UpdatedAt = new Date().toISOString();

        const { data, error } = await supabase
            .from('teacher_payment')
            .update(updates)
            .eq('TeacherPaymentID', paymentId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getTeacherPaymentById(paymentId) {
        const { data, error } = await supabase
            .from('teacher_payment')
            .select('*')
            .eq('TeacherPaymentID', paymentId)
            .single();

        if (error) throw error;
        return data;
    }

    async getPaymentsByTeacher(teacherId) {
        const { data, error } = await supabase
            .from('teacher_payment')
            .select('*')
            .eq('TeacherID', teacherId)
            .order('PaymentDate', { ascending: false });

        if (error) throw error;
        return data;
    }
}
