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
        const canonical = this.buildTeacherPayload(teacherId, paymentData, processedBy);

        const { data, error } = await supabase
            .from('teacher_payment')
            .insert(canonical)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    buildTeacherPayload(teacherId, paymentData, processedBy) {
        // Construct canonical payload expected by the teacher_payment table
        const today = new Date();
        const paymentDate = paymentData.PaymentDate || today.toISOString().split('T')[0];
        const paymentPeriod = paymentData.PaymentPeriod || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;

        const baseSalary = Number(paymentData.BaseSalary ?? paymentData.BasePay ?? 0) || 0;
        const bonuses = Number(paymentData.Bonuses ?? 0) || 0;
        const overtime = Number(paymentData.Overtime ?? 0) || 0;
        const deductions = Number(paymentData.Deductions ?? 0) || 0;

        const totalFromParts = baseSalary + bonuses + overtime - deductions;
        const totalAmount = (paymentData.TotalAmount !== undefined && paymentData.TotalAmount !== null)
            ? Number(paymentData.TotalAmount)
            : totalFromParts;

        // Teacher payments table does not track PaidAmount; default to provided status or Pending
        const status = paymentData.Status || 'Pending';

        return {
            EmpID: teacherId,
            PaymentPeriod: paymentPeriod,
            PeriodStartDate: paymentData.PeriodStartDate || paymentPeriod,
            PeriodEndDate: paymentData.PeriodEndDate || paymentPeriod,
            BaseSalary: baseSalary,
            Bonuses: bonuses,
            Overtime: overtime,
            Deductions: deductions,
            TotalAmount: totalAmount,
            // Note: `PaidAmount` column is not present in some schemas; omit it.
            PaymentDate: paymentDate,
            PaymentMethod: paymentData.PaymentMethod || 'Transfer',
            Status: paymentData.Status || status,
            TransactionReference: paymentData.TransactionReference || null,
            Notes: paymentData.Notes || null,
            ProcessedBy: processedBy || null,
            CreatedBy: processedBy || null
        };
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
            .eq('EmpID', teacherId)
            .order('PaymentDate', { ascending: false });

        if (error) throw error;
        return data;
    }
}
