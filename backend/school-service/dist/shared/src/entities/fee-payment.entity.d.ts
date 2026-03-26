import { FeeInvoice } from './fee-invoice.entity';
export declare class FeePayment {
    id: string;
    invoice_id: string;
    invoice: FeeInvoice;
    amount: number;
    school_id: string;
    payment_date: Date;
}
