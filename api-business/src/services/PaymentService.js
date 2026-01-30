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

        // Try inserting; if the table schema doesn't include BalanceRemaining
        // (or other unexpected column), retry without that field.
        try {
            const { data, error } = await supabase
                .from('teacher_payment')
                .insert(payment)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            const msg = (err && err.message) ? err.message : String(err);
            // If error indicates missing columns in the table schema, attempt
            // iterative retries removing the missing column from the payload.
            if (msg.toLowerCase().includes('could not find the') || msg.toLowerCase().includes('column')) {
                const extractColumn = (m) => {
                    try {
                        const rx = /'([^']+)' column/i;
                        const match = m.match(/'([^']+)'/);
                        if (match && match[1]) return match[1];
                    } catch (e) { }
                    return null;
                };

                let fallback = { ...payment };
                // Some DB schemas expect EmpID instead of TeacherID — map it automatically
                if (!Object.prototype.hasOwnProperty.call(fallback, 'EmpID') && Object.prototype.hasOwnProperty.call(fallback, 'TeacherID')) {
                    fallback.EmpID = fallback.TeacherID;
                }
                const tried = new Set();
                let attempts = 0;
                const getDefaultFor = (col) => {
                    const lower = col.toLowerCase();
                    if (lower.endsWith('id') || lower === 'empid') return fallback.TeacherID || fallback.EmpID || null;
                    if (lower.includes('amount') || lower.includes('paid') || lower.includes('rate') || lower.includes('hours')) return 0;
                    if (lower.includes('period')) {
                        const d = new Date();
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
                    }
                    if (lower.includes('date')) return fallback.PaymentDate || new Date().toISOString().split('T')[0];
                    if (lower.includes('status')) return fallback.Status || 'Paid';
                    return 0;
                };

                while (attempts < 12) {
                    attempts++;
                    try {
                        const { data: data2, error: error2 } = await supabase
                            .from('teacher_payment')
                            .insert(fallback)
                            .select()
                            .single();
                        if (error2) throw error2;
                        return data2;
                    } catch (err2) {
                        const m2 = (err2 && err2.message) ? err2.message : String(err2);
                        const col = extractColumn(m2) || extractColumn(msg) || null;
                        // If it's a null constraint violation, supply a default value
                        const nullMatch = m2.match(/null value in column "([^"]+)"/i);
                        if (nullMatch && nullMatch[1]) {
                            const colName = nullMatch[1];
                            const key = Object.keys(fallback).find(k => k.toLowerCase() === colName.toLowerCase()) || colName;
                            if (!tried.has(key)) {
                                tried.add(key);
                                fallback[key] = getDefaultFor(colName);
                                continue;
                            }
                        }

                        if (!col) throw err2;
                        // Normalize key names to match our payload keys
                        const key2 = Object.keys(fallback).find(k => k.toLowerCase() === col.toLowerCase());
                        if (key2 && !tried.has(key2)) {
                            tried.add(key2);
                            delete fallback[key2];
                            continue;
                        }
                        throw err2;
                    }
                }
            }
            throw err;
        }
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
