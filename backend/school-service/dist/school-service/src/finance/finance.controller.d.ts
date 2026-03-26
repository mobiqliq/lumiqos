import { FinanceService } from './finance.service';
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    createFeeCategory(dto: {
        name: string;
        description?: string;
    }): Promise<import("@lumiqos/shared/index").FeeCategory[]>;
    getFeeCategories(): Promise<import("@lumiqos/shared/index").FeeCategory[]>;
    createFeeStructure(dto: {
        class_id: string;
        fee_category_id: string;
        amount: number;
        frequency?: string;
    }): Promise<import("@lumiqos/shared/index").FeeStructure[]>;
    getFeeStructures(): Promise<import("@lumiqos/shared/index").FeeStructure[]>;
    createStudentAccount(dto: {
        student_id: string;
        academic_year_id: string;
    }): Promise<import("@lumiqos/shared/index").StudentFeeAccount>;
    getStudentAccounts(studentId: string): Promise<import("@lumiqos/shared/index").StudentFeeAccount[]>;
    generateInvoice(dto: {
        student_id: string;
        academic_year_id: string;
        fee_category_id: string;
        amount: number;
        due_date: string;
    }): Promise<import("@lumiqos/shared/index").FeeInvoice>;
    recordPayment(dto: {
        invoice_id: string;
        amount: number;
        payment_method: string;
        transaction_reference?: string;
    }): Promise<import("@lumiqos/shared/index").FeePayment>;
    getStudentFeeStatus(studentId: string): Promise<{
        total_fee: number;
        total_paid: number;
        total_pending: number;
        total_overdue: number;
        invoices: {
            computed_status: string;
            id: string;
            invoice_id: string;
            student_id: string;
            academic_year_id: string;
            fee_category_id: string;
            school_id: string;
            amount: number;
            remaining_balance: number;
            due_date: Date;
            status: string;
            created_at: Date;
            updated_at: Date;
        }[];
    }>;
    getInventoryPredictions(): Promise<import("@lumiqos/shared/index").InventoryItem[]>;
    autoReorder(itemId: string): Promise<import("@lumiqos/shared/index").InventoryItem>;
}
