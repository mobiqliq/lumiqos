import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '@lumiqos/shared/index';
import { RbacGuard } from '@lumiqos/shared/index';
import { RequirePermissions } from '@lumiqos/shared/index';

@Controller('finance')
@UseGuards(JwtAuthGuard, RbacGuard)
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    @Post('fee-categories')
    @RequirePermissions('finance:write')
    createFeeCategory(@Body() dto: { name: string; description?: string }) {
        return this.financeService.createFeeCategory(dto);
    }

    @Get('fee-categories')
    @RequirePermissions('finance:read')
    getFeeCategories() {
        return this.financeService.getFeeCategories();
    }

    @Post('fee-structures')
    @RequirePermissions('finance:write')
    createFeeStructure(@Body() dto: { class_id: string; fee_category_id: string; amount: number; frequency?: string }) {
        return this.financeService.createFeeStructure(dto);
    }

    @Get('fee-structures')
    @RequirePermissions('finance:read')
    getFeeStructures() {
        return this.financeService.getFeeStructures();
    }

    @Post('accounts')
    @RequirePermissions('finance:write')
    createStudentAccount(@Body() dto: { student_id: string; academic_year_id: string }) {
        return this.financeService.createStudentAccount(dto.student_id, dto.academic_year_id);
    }

    @Get('accounts/:student_id')
    @RequirePermissions('finance:read')
    getStudentAccounts(@Param('student_id') studentId: string) {
        return this.financeService.getStudentAccounts(studentId);
    }

    @Post('invoices')
    @RequirePermissions('finance:write')
    generateInvoice(@Body() dto: { student_id: string; academic_year_id: string; fee_category_id: string; amount: number; due_date: string }) {
        return this.financeService.generateInvoice(dto);
    }

    @Post('payments')
    @RequirePermissions('finance:write')
    recordPayment(@Body() dto: { invoice_id: string; amount: number; payment_method: string; transaction_reference?: string }) {
        return this.financeService.recordPayment(dto);
    }

    @Get('student/:student_id')
    @RequirePermissions('finance:read')
    getStudentFeeStatus(@Param('student_id') studentId: string) {
        return this.financeService.getStudentFeeStatus(studentId);
    }

    // --- Predictive Procurement ---
    @Get('inventory/predictions')
    @RequirePermissions('finance:read') // Requires proper finance or admin role
    getInventoryPredictions() {
        return this.financeService.getInventoryPredictions();
    }

    @Post('inventory/reorder/:id')
    @RequirePermissions('finance:write')
    autoReorder(@Param('id') itemId: string) {
        return this.financeService.autoReorder(itemId);
    }
}
