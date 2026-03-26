import { Repository } from 'typeorm';
import { FeeCategory } from '@lumiqos/shared/src/entities/fee-category.entity';
import { FeeStructure } from '@lumiqos/shared/src/entities/fee-structure.entity';
import { StudentFeeAccount } from '@lumiqos/shared/src/entities/student-fee-account.entity';
import { FeeInvoice } from '@lumiqos/shared/src/entities/fee-invoice.entity';
import { FeePayment } from '@lumiqos/shared/src/entities/fee-payment.entity';
import { Student } from '@lumiqos/shared/src/entities/student.entity';
import { InventoryItem } from '@lumiqos/shared/src/entities/inventory-item.entity';
export declare class FinanceService {
    private readonly categoryRepo;
    private readonly structureRepo;
    private readonly accountRepo;
    private readonly invoiceRepo;
    private readonly paymentRepo;
    private readonly studentRepo;
    private readonly inventoryRepo;
    constructor(categoryRepo: Repository<FeeCategory>, structureRepo: Repository<FeeStructure>, accountRepo: Repository<StudentFeeAccount>, invoiceRepo: Repository<FeeInvoice>, paymentRepo: Repository<FeePayment>, studentRepo: Repository<Student>, inventoryRepo: Repository<InventoryItem>);
    createFeeCategory(dto: any): Promise<FeeCategory[]>;
    getFeeCategories(): Promise<FeeCategory[]>;
    createFeeStructure(dto: any): Promise<FeeStructure[]>;
    getFeeStructures(): Promise<FeeStructure[]>;
    createStudentAccount(studentId: string, academicYearId: string): Promise<StudentFeeAccount>;
    getStudentAccounts(studentId: string): Promise<StudentFeeAccount[]>;
    generateInvoice(dto: any): Promise<FeeInvoice>;
    recordPayment(dto: any): Promise<FeePayment>;
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
    getInventoryPredictions(): Promise<InventoryItem[]>;
    autoReorder(itemId: string): Promise<InventoryItem>;
}
