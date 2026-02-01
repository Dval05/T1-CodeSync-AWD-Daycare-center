import supabase from '../config/supabase.js';

export class InvoiceService {
    // referenceType: 'Student' | 'Teacher'
    async generateInvoice(referenceType, referenceId, paymentData, createdBy) {
        const invoiceNumber = await this.generateInvoiceNumber();
        
        const invoiceData = {
            InvoiceNumber: invoiceNumber,
            InvoiceType: referenceType,
            ReferenceID: referenceId,
            IssueDate: new Date().toISOString().split('T')[0],
            DueDate: paymentData.DueDate,
            TotalAmount: paymentData.TotalAmount,
            TaxAmount: paymentData.TaxAmount || 0,
            DiscountAmount: paymentData.DiscountAmount || 0,
            FinalAmount: this.calculateFinalAmount(paymentData),
            Description: paymentData.Description,
            Status: 'Issued',
            CreatedBy: createdBy
        };

        const { data: invoice, error } = await supabase
            .from('invoice')
            .insert(invoiceData)
            .select()
            .single();

        if (error) throw error;
        return invoice;
    }

    async generateInvoiceNumber() {
        const prefix = 'FAC';
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        
        const { count } = await supabase
            .from('invoice')
            .select('*', { count: 'exact', head: true })
            .like('InvoiceNumber', `${prefix}-${year}${month}%`);
        
        const sequence = ((count || 0) + 1).toString().padStart(5, '0');
        return `${prefix}-${year}${month}-${sequence}`;
    }

    calculateFinalAmount(paymentData) {
        const total = Number(paymentData.TotalAmount) || 0;
        const tax = Number(paymentData.TaxAmount) || 0;
        const discount = Number(paymentData.DiscountAmount) || 0;
        return total + tax - discount;
    }

    async getInvoiceById(invoiceId) {
        const { data, error } = await supabase
            .from('invoice')
            .select('*')
            .eq('InvoiceID', invoiceId)
            .single();

        if (error) throw error;
        return data;
    }

    async updateInvoiceStatus(invoiceId, status) {
        const { data, error } = await supabase
            .from('invoice')
            .update({ Status: status, UpdatedAt: new Date().toISOString() })
            .eq('InvoiceID', invoiceId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
