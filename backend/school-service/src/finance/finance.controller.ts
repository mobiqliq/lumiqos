import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '@lumiqos/shared/index';
import { RbacGuard } from '@lumiqos/shared/index';
import { RequirePermissions } from '@lumiqos/shared/index';
import { TenantContext } from '@lumiqos/shared/index';
import type { Request } from 'express';

@Controller('finance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    @Get('overview')
    getFinanceOverview(@Req() req: Request) {
        const schoolId = (req.headers['x-school-id'] as string) || TenantContext.getStore()?.schoolId;
        return this.financeService.getFinanceOverview(schoolId as string);
    }

    @Post('fee-categories')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequirePermissions('finance:write')
    createFeeCategory(@Body() dto: { name: string; description?: string }) {
        return this.financeService.createFeeCategory(dto);
    }

    @Get('fee-categories')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequirePermissions('finance:read')
    getFeeCategories() {
        return this.financeService.getFeeCategories();
    }

    @Post('fee-structures')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequirePermissions('finance:write')
    createFeeStructure(@Body() dto: { class_id: string; fee_category_id: string; amount: number; frequency?: string }) {
        return this.financeService.createFeeStructure(dto);
    }

    @Get('fee-structures')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequirePermissions('finance:read')
    getFeeStructures() {
        return this.financeService.getFeeStructures();
    }

    @Post('accounts')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequirePermissions('finance:write')
    createStudentAccount(@Body() dto: { student_id: string; academic_year_id: string }) {
        return this.financeService.createStudentAccount(dto.student_id, dto.academic_year_id);
    }

    @Get('accounts/:student_id')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequirePermissions('finance:read')
    getStudentAccounts(@Param('student_id') studentId: string) {
        return this.financeService.getStudentAccounts(studentId);
    }

    @Post('invoices')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequirePermissions('finance:write')
    generateInvoice(@Body() dto: { student_id: string; academic_year_id: string; fee_category_id: string; amount: number; due_date: string }) {
        return this.financeService.generateInvoice(dto);
    }

    @Post('payments')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequirePermissions('finance:write')
    recordPayment(@Body() dto: { invoice_id: string; amount: number; payment_method: string; transaction_reference?: string }) {
        return this.financeService.recordPayment(dto);
    }

    @Get('student/:student_id')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequirePermissions('finance:read')
    getStudentFeeStatus(@Param('student_id') studentId: string) {
        return this.financeService.getStudentFeeStatus(studentId);
    }

    @Get('inventory/predictions')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequirePermissions('finance:read')
    getInventoryPredictions() {
        return this.financeService.getInventoryPredictions();
    }

    @Post('inventory/reorder/:id')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequirePermissions('finance:write')
    autoReorder(@Param('id') itemId: string) {
        return this.financeService.autoReorder(itemId);
    }
}
