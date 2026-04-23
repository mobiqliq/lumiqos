import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeCategory } from '@xceliqos/shared/src/entities/fee-category.entity';
import { FeeStructure } from '@xceliqos/shared/src/entities/fee-structure.entity';
import { StudentFeeAccount } from '@xceliqos/shared/src/entities/student-fee-account.entity';
import { FeeInvoice } from '@xceliqos/shared/src/entities/fee-invoice.entity';
import { FeePayment } from '@xceliqos/shared/src/entities/fee-payment.entity';
import { TenantContext } from '@xceliqos/shared/index';
import { InvoiceStatus } from '@xceliqos/shared/index';
import { Student } from '@xceliqos/shared/src/entities/student.entity';
import { InventoryItem } from '@xceliqos/shared/src/entities/inventory-item.entity';

@Injectable()
export class FinanceService {
    constructor(
        @InjectRepository(FeeCategory) private readonly categoryRepo: Repository<FeeCategory>,
        @InjectRepository(FeeStructure) private readonly structureRepo: Repository<FeeStructure>,
        @InjectRepository(StudentFeeAccount) private readonly accountRepo: Repository<StudentFeeAccount>,
        @InjectRepository(FeeInvoice) private readonly invoiceRepo: Repository<FeeInvoice>,
        @InjectRepository(FeePayment) private readonly paymentRepo: Repository<FeePayment>,
        @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
        @InjectRepository(InventoryItem) private readonly inventoryRepo: Repository<InventoryItem>
    ) { }

    async createFeeCategory(dto: any) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const category = this.categoryRepo.create({ ...dto, school_id: schoolId });
        return this.categoryRepo.save(category);
    }

    async getFeeCategories() {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        return this.categoryRepo.find({ where: { school_id: schoolId } });
    }

    async createFeeStructure(dto: any) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const structure = this.structureRepo.create({ ...dto, school_id: schoolId });
        return this.structureRepo.save(structure);
    }

    async getFeeStructures() {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        return this.structureRepo.find({ where: { school_id: schoolId }, relations: ['fee_category', 'studentClass'] });
    }

    async createStudentAccount(studentId: string, academicYearId: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        // Verify isolation
        const student = await this.studentRepo.findOne({ where: { student_id: studentId, school_id: schoolId } });
        if (!student) throw new NotFoundException('Student not found in this school');

        const existing = await this.accountRepo.findOne({
            where: { school_id: schoolId, student_id: studentId, academic_year_id: academicYearId }
        });
        if (existing) throw new BadRequestException('Account already exists for this year');

        const account = this.accountRepo.create({
            school_id: schoolId,
            student_id: studentId,
            academic_year_id: academicYearId,
            total_fee: 0,
            discount: 0,
            balance: 0
        });
        return this.accountRepo.save(account);
    }

    async getStudentAccounts(studentId: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        return this.accountRepo.find({ where: { school_id: schoolId, student_id: studentId } });
    }

    async generateInvoice(dto: any) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        // Verify Isolation
        const student = await this.studentRepo.findOne({ where: { student_id: dto.student_id, school_id: schoolId } });
        if (!student) throw new NotFoundException('Student not found in this school');

        if (dto.amount <= 0) {
            throw new BadRequestException('Invoice amount must be positive');
        }

        // Verify Duplicate (Unique index covers student, year, category, due_date)
        const existing = await this.invoiceRepo.findOne({
            where: {
                student_id: dto.student_id,
                academic_year_id: dto.academic_year_id,
                fee_category_id: dto.fee_category_id,
                due_date: new Date(dto.due_date),
                school_id: schoolId
            }
        });

        if (existing) {
            throw new BadRequestException('Invoice already exists for this period');
        }

        const invoice = this.invoiceRepo.create({
            school_id: schoolId,
            student_id: dto.student_id,
            academic_year_id: dto.academic_year_id,
            fee_category_id: dto.fee_category_id,
            amount: dto.amount,
            remaining_balance: dto.amount,
            due_date: new Date(dto.due_date),
            status: InvoiceStatus.PENDING
        });

        const savedInvoice = await this.invoiceRepo.save(invoice);

        // Update StudentFeeAccount Ledger
        let account = await this.accountRepo.findOne({
            where: { student_id: dto.student_id, academic_year_id: dto.academic_year_id, school_id: schoolId }
        });

        if (!account) {
            // Auto init if missing
            account = await this.createStudentAccount(dto.student_id, dto.academic_year_id);
        }

        account.total_fee = Number(account.total_fee) + Number(dto.amount);
        account.balance = Number(account.balance) + Number(dto.amount);
        await this.accountRepo.save(account);

        return savedInvoice;
    }

    async recordPayment(dto: any) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        return await this.invoiceRepo.manager.transaction(async tx => {
            const invoice = await tx.findOne(FeeInvoice, {
                where: { invoice_id: dto.invoice_id, school_id: schoolId }
            });

            if (!invoice) throw new NotFoundException('Invoice not found');
            if (invoice.remaining_balance <= 0 || invoice.status === InvoiceStatus.PAID) {
                throw new BadRequestException('Invoice is already fully paid');
            }

            if (dto.amount > invoice.remaining_balance) {
                throw new BadRequestException('Payment cannot exceed invoice remaining balance');
            }

            if (dto.payment_method !== 'cash' && !dto.transaction_reference) {
                throw new BadRequestException('transaction_reference required for non-cash payments');
            }

            // Create Immutable Payment
            const payment = tx.create(FeePayment, {
                school_id: schoolId,
                invoice_id: dto.invoice_id,
                amount: dto.amount,
                payment_method: dto.payment_method,
                transaction_reference: dto.transaction_reference || null
            });
            await tx.save(FeePayment, payment);

            // Update Invoice Balance internally
            invoice.remaining_balance = Number(invoice.remaining_balance) - Number(dto.amount);
            if (invoice.remaining_balance === 0) {
                invoice.status = InvoiceStatus.PAID;
            } else {
                invoice.status = InvoiceStatus.PENDING; // Reorient just in case
            }
            await tx.save(FeeInvoice, invoice);

            // Update Student Ledger Balance
            const account = await tx.findOne(StudentFeeAccount, {
                where: { student_id: invoice.student_id, academic_year_id: invoice.academic_year_id, school_id: schoolId }
            });

            if (account) {
                account.balance = Number(account.balance) - Number(dto.amount);
                await tx.save(StudentFeeAccount, account);
            }

            return payment;
        });
    }

    async getStudentFeeStatus(studentId: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        // Ensure isolation
        const student = await this.studentRepo.findOne({ where: { student_id: studentId, school_id: schoolId } });
        if (!student) throw new NotFoundException('Student not found in this school');

        const invoices = await this.invoiceRepo.find({ where: { student_id: studentId, school_id: schoolId } });
        const accounts = await this.accountRepo.find({ where: { student_id: studentId, school_id: schoolId } });

        let totalFee = 0;
        let totalPaid = 0;
        let totalPending = 0;
        let totalOverdue = 0;

        const now = new Date();

        for (const account of accounts) {
            totalFee += Number(account.total_fee) - Number(account.discount);
        }

        const calculatedInvoices = invoices.map(inv => {
            const isOverdue = inv.status === InvoiceStatus.PENDING && new Date(inv.due_date) < now && Number(inv.remaining_balance) > 0;
            const dynamicStatus = isOverdue ? InvoiceStatus.OVERDUE : inv.status;

            const remaining = Number(inv.remaining_balance);
            const paid = Number(inv.amount) - remaining;

            totalPaid += paid;

            if (dynamicStatus === InvoiceStatus.OVERDUE) {
                totalOverdue += remaining;
                totalPending += remaining;
            } else if (dynamicStatus === InvoiceStatus.PENDING) {
                totalPending += remaining;
            }

            return {
                ...inv,
                computed_status: dynamicStatus
            };
        });

        return {
            total_fee: totalFee,
            total_paid: totalPaid,
            total_pending: totalPending,
            total_overdue: totalOverdue,
            invoices: calculatedInvoices
        };
    }

    // --- Predictive Procurement ---
    async getInventoryPredictions() {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        // In a real app, AI service would dynamically tag run_out_prediction and status
        return this.inventoryRepo.find({ where: { school_id: schoolId } });
    }

    async autoReorder(itemId: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        const item = await this.inventoryRepo.findOne({ where: { id: itemId, school_id: schoolId } });
        if (!item) throw new NotFoundException('Inventory item not found');

        // Mock auto-reorder flow
        item.current_stock += 500; // Mock restocking
        item.status = 'Healthy';
        item.run_out_prediction = 'In 8 Months';
        return this.inventoryRepo.save(item);
    }

    async getFinanceOverview(schoolId: string) {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

        const [totalCollected, outstanding, overdueCount, defaulters, mtdCollected] = await Promise.all([
            this.paymentRepo.createQueryBuilder('p')
                .where('p.school_id = :schoolId', { schoolId })
                .select('SUM(p.amount)', 'total')
                .getRawOne(),
            this.invoiceRepo.createQueryBuilder('inv')
                .where('inv.school_id = :schoolId', { schoolId })
                .andWhere('inv.remaining_balance > 0')
                .select('SUM(inv.remaining_balance)', 'total')
                .getRawOne(),
            this.invoiceRepo.createQueryBuilder('inv')
                .where('inv.school_id = :schoolId', { schoolId })
                .andWhere('inv.due_date < :today', { today: todayStr })
                .andWhere('inv.remaining_balance > 0')
                .getCount(),
            this.invoiceRepo.createQueryBuilder('inv')
                .where('inv.school_id = :schoolId', { schoolId })
                .andWhere('inv.due_date < :today', { today: todayStr })
                .andWhere('inv.remaining_balance > 0')
                .select('COUNT(DISTINCT inv.student_id)', 'count')
                .getRawOne(),
            this.paymentRepo.createQueryBuilder('p')
                .where('p.school_id = :schoolId', { schoolId })
                .andWhere('DATE(p.payment_date) >= :startOfMonth', { startOfMonth })
                .select('SUM(p.amount)', 'total')
                .getRawOne(),
        ]);

        return {
            total_collected: Number(totalCollected?.total || 0),
            outstanding_fees: Number(outstanding?.total || 0),
            overdue_invoices: overdueCount,
            defaulter_count: Number(defaulters?.count || 0),
            mtd_collected: Number(mtdCollected?.total || 0),
        };
    }
}
