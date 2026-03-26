"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fee_category_entity_1 = require("../../../shared/src/entities/fee-category.entity");
const fee_structure_entity_1 = require("../../../shared/src/entities/fee-structure.entity");
const student_fee_account_entity_1 = require("../../../shared/src/entities/student-fee-account.entity");
const fee_invoice_entity_1 = require("../../../shared/src/entities/fee-invoice.entity");
const fee_payment_entity_1 = require("../../../shared/src/entities/fee-payment.entity");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const student_entity_1 = require("../../../shared/src/entities/student.entity");
const inventory_item_entity_1 = require("../../../shared/src/entities/inventory-item.entity");
let FinanceService = class FinanceService {
    categoryRepo;
    structureRepo;
    accountRepo;
    invoiceRepo;
    paymentRepo;
    studentRepo;
    inventoryRepo;
    constructor(categoryRepo, structureRepo, accountRepo, invoiceRepo, paymentRepo, studentRepo, inventoryRepo) {
        this.categoryRepo = categoryRepo;
        this.structureRepo = structureRepo;
        this.accountRepo = accountRepo;
        this.invoiceRepo = invoiceRepo;
        this.paymentRepo = paymentRepo;
        this.studentRepo = studentRepo;
        this.inventoryRepo = inventoryRepo;
    }
    async createFeeCategory(dto) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const category = this.categoryRepo.create({ ...dto, school_id: schoolId });
        return this.categoryRepo.save(category);
    }
    async getFeeCategories() {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        return this.categoryRepo.find({ where: { school_id: schoolId } });
    }
    async createFeeStructure(dto) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const structure = this.structureRepo.create({ ...dto, school_id: schoolId });
        return this.structureRepo.save(structure);
    }
    async getFeeStructures() {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        return this.structureRepo.find({ where: { school_id: schoolId }, relations: ['fee_category', 'studentClass'] });
    }
    async createStudentAccount(studentId, academicYearId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const student = await this.studentRepo.findOne({ where: { student_id: studentId, school_id: schoolId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found in this school');
        const existing = await this.accountRepo.findOne({
            where: { school_id: schoolId, student_id: studentId, academic_year_id: academicYearId }
        });
        if (existing)
            throw new common_1.BadRequestException('Account already exists for this year');
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
    async getStudentAccounts(studentId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        return this.accountRepo.find({ where: { school_id: schoolId, student_id: studentId } });
    }
    async generateInvoice(dto) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const student = await this.studentRepo.findOne({ where: { student_id: dto.student_id, school_id: schoolId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found in this school');
        if (dto.amount <= 0) {
            throw new common_1.BadRequestException('Invoice amount must be positive');
        }
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
            throw new common_1.BadRequestException('Invoice already exists for this period');
        }
        const invoice = this.invoiceRepo.create({
            school_id: schoolId,
            student_id: dto.student_id,
            academic_year_id: dto.academic_year_id,
            fee_category_id: dto.fee_category_id,
            amount: dto.amount,
            remaining_balance: dto.amount,
            due_date: new Date(dto.due_date),
            status: index_2.InvoiceStatus.PENDING
        });
        const savedInvoice = await this.invoiceRepo.save(invoice);
        let account = await this.accountRepo.findOne({
            where: { student_id: dto.student_id, academic_year_id: dto.academic_year_id, school_id: schoolId }
        });
        if (!account) {
            account = await this.createStudentAccount(dto.student_id, dto.academic_year_id);
        }
        account.total_fee = Number(account.total_fee) + Number(dto.amount);
        account.balance = Number(account.balance) + Number(dto.amount);
        await this.accountRepo.save(account);
        return savedInvoice;
    }
    async recordPayment(dto) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        return await this.invoiceRepo.manager.transaction(async (tx) => {
            const invoice = await tx.findOne(fee_invoice_entity_1.FeeInvoice, {
                where: { invoice_id: dto.invoice_id, school_id: schoolId }
            });
            if (!invoice)
                throw new common_1.NotFoundException('Invoice not found');
            if (invoice.remaining_balance <= 0 || invoice.status === index_2.InvoiceStatus.PAID) {
                throw new common_1.BadRequestException('Invoice is already fully paid');
            }
            if (dto.amount > invoice.remaining_balance) {
                throw new common_1.BadRequestException('Payment cannot exceed invoice remaining balance');
            }
            if (dto.payment_method !== 'cash' && !dto.transaction_reference) {
                throw new common_1.BadRequestException('transaction_reference required for non-cash payments');
            }
            const payment = tx.create(fee_payment_entity_1.FeePayment, {
                school_id: schoolId,
                invoice_id: dto.invoice_id,
                amount: dto.amount,
                payment_method: dto.payment_method,
                transaction_reference: dto.transaction_reference || null
            });
            await tx.save(fee_payment_entity_1.FeePayment, payment);
            invoice.remaining_balance = Number(invoice.remaining_balance) - Number(dto.amount);
            if (invoice.remaining_balance === 0) {
                invoice.status = index_2.InvoiceStatus.PAID;
            }
            else {
                invoice.status = index_2.InvoiceStatus.PENDING;
            }
            await tx.save(fee_invoice_entity_1.FeeInvoice, invoice);
            const account = await tx.findOne(student_fee_account_entity_1.StudentFeeAccount, {
                where: { student_id: invoice.student_id, academic_year_id: invoice.academic_year_id, school_id: schoolId }
            });
            if (account) {
                account.balance = Number(account.balance) - Number(dto.amount);
                await tx.save(student_fee_account_entity_1.StudentFeeAccount, account);
            }
            return payment;
        });
    }
    async getStudentFeeStatus(studentId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const student = await this.studentRepo.findOne({ where: { student_id: studentId, school_id: schoolId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found in this school');
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
            const isOverdue = inv.status === index_2.InvoiceStatus.PENDING && new Date(inv.due_date) < now && Number(inv.remaining_balance) > 0;
            const dynamicStatus = isOverdue ? index_2.InvoiceStatus.OVERDUE : inv.status;
            const remaining = Number(inv.remaining_balance);
            const paid = Number(inv.amount) - remaining;
            totalPaid += paid;
            if (dynamicStatus === index_2.InvoiceStatus.OVERDUE) {
                totalOverdue += remaining;
                totalPending += remaining;
            }
            else if (dynamicStatus === index_2.InvoiceStatus.PENDING) {
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
    async getInventoryPredictions() {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        return this.inventoryRepo.find({ where: { school_id: schoolId } });
    }
    async autoReorder(itemId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const item = await this.inventoryRepo.findOne({ where: { id: itemId, school_id: schoolId } });
        if (!item)
            throw new common_1.NotFoundException('Inventory item not found');
        item.current_stock += 500;
        item.status = 'Healthy';
        item.run_out_prediction = 'In 8 Months';
        return this.inventoryRepo.save(item);
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fee_category_entity_1.FeeCategory)),
    __param(1, (0, typeorm_1.InjectRepository)(fee_structure_entity_1.FeeStructure)),
    __param(2, (0, typeorm_1.InjectRepository)(student_fee_account_entity_1.StudentFeeAccount)),
    __param(3, (0, typeorm_1.InjectRepository)(fee_invoice_entity_1.FeeInvoice)),
    __param(4, (0, typeorm_1.InjectRepository)(fee_payment_entity_1.FeePayment)),
    __param(5, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(6, (0, typeorm_1.InjectRepository)(inventory_item_entity_1.InventoryItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FinanceService);
//# sourceMappingURL=finance.service.js.map