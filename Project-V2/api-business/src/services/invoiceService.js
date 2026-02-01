import supabase from '../config/supabase.js';

export class InvoiceService {
    async generateInvoiceNumber() {
        const prefix = 'FAC';
        const now = new Date();
        const yy = now.getFullYear().toString().slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');

        const { count, error } = await supabase
            .from('invoice')
            .select('*', { count: 'exact', head: true })
            .like('InvoiceNumber', `${prefix}-${yy}${mm}%`);
        if (error) throw error;
        const seq = String((count || 0) + 1).padStart(5, '0');
        return `${prefix}-${yy}${mm}-${seq}`;
    }

    calculateTotals(items = [], tax = 0, discount = 0) {
        const subtotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
        const taxAmount = Number(tax) || 0;
        const discountAmount = Number(discount) || 0;
        const finalAmount = subtotal + taxAmount - discountAmount;
        return { subtotal, taxAmount, discountAmount, finalAmount };
    }

    monthToDueDate(monthStr) {
        // monthStr expected 'YYYY-MM'
        if (!monthStr) return new Date().toISOString().split('T')[0];
        const [y, m] = monthStr.split('-').map(Number);
        const lastDay = new Date(y, m, 0); // day 0 of next month = last day of month
        return lastDay.toISOString().split('T')[0];
    }

    async createInvoice({ studentId, month, items, createdBy }) {
        const invoiceNumber = await this.generateInvoiceNumber();
        const issueDate = new Date().toISOString().split('T')[0];
        const dueDate = this.monthToDueDate(month);
        const { taxAmount, discountAmount, finalAmount } = this.calculateTotals(items, 0, 0);

        const payload = {
            InvoiceNumber: invoiceNumber,
            InvoiceType: 'Student',
            ReferenceID: Number(studentId),
            IssueDate: issueDate,
            DueDate: dueDate,
            TotalAmount: finalAmount,
            TaxAmount: 0,
            DiscountAmount: 0,
            FinalAmount: finalAmount,
            Description: JSON.stringify({ items }),
            Status: 'Issued',
            CreatedBy: createdBy || null,
        };

        const { data, error } = await supabase
            .from('invoice')
            .insert(payload)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async getInvoiceById(id) {
        const { data, error } = await supabase
            .from('invoice')
            .select('*')
            .eq('InvoiceID', id)
            .single();
        if (error) throw error;
        return data;
    }

    async updateInvoice(id, { items, taxAmount = 0, discountAmount = 0 }) {
        const existing = await this.getInvoiceById(id);
        if (['Paid', 'Canceled'].includes(existing.Status)) {
            throw new Error('La factura no se puede editar en su estado actual');
        }

        const { finalAmount } = this.calculateTotals(items || [], taxAmount, discountAmount);
        const updates = {
            Description: JSON.stringify({ items }),
            TaxAmount: Number(taxAmount) || 0,
            DiscountAmount: Number(discountAmount) || 0,
            TotalAmount: finalAmount,
            FinalAmount: finalAmount,
            UpdatedAt: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('invoice')
            .update(updates)
            .eq('InvoiceID', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async cancelInvoice(id, reason) {
        const existing = await this.getInvoiceById(id);
        if (existing.Status === 'Paid') {
            throw new Error('No se puede anular una factura pagada');
        }
        const desc = (() => {
            try {
                const json = existing.Description ? JSON.parse(existing.Description) : {};
                return JSON.stringify({ ...json, canceled: { reason, at: new Date().toISOString() } });
            } catch {
                return existing.Description || '';
            }
        })();

        const { data, error } = await supabase
            .from('invoice')
            .update({ Status: 'Canceled', Description: desc, UpdatedAt: new Date().toISOString() })
            .eq('InvoiceID', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
}
