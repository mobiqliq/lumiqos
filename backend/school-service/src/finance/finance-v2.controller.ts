import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common";
import { FinanceV2Service } from "./finance-v2.service";
import { JwtAuthGuard } from "@xceliqos/shared";
import { RbacGuard } from "@xceliqos/shared";
import { RequirePermissions } from "@xceliqos/shared";

@Controller("finance/v2")
export class FinanceV2Controller {
  constructor(private readonly financeV2Service: FinanceV2Service) {}

  // Ledger
  @Post("ledger")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:write")
  upsertLedger(@Body() dto: any) { return this.financeV2Service.upsertLedger(dto); }

  @Get("ledger")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:read")
  getLedger(@Query("academic_year_id") academicYearId: string) { return this.financeV2Service.getLedger(academicYearId); }

  // Journal entries
  @Post("entries")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:write")
  createEntry(@Body() dto: any) { return this.financeV2Service.createEntry(dto); }

  @Get("entries")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:read")
  getEntries(@Query("ledger_id") ledgerId: string, @Query("entry_type") entryType?: string) {
    return this.financeV2Service.getEntries(ledgerId, entryType);
  }

  @Post("entries/:id/reverse")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:write")
  reverseEntry(@Param("id") id: string, @Body() dto: { reason: string }) {
    return this.financeV2Service.reverseEntry(id, dto.reason);
  }

  // Tax invoices
  @Post("tax-invoices")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:write")
  createTaxInvoice(@Body() dto: any) { return this.financeV2Service.createTaxInvoice(dto); }

  @Get("tax-invoices")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:read")
  getTaxInvoices(@Query("status") status?: string, @Query("framework") framework?: string) {
    return this.financeV2Service.getTaxInvoices({ status, framework });
  }

  @Patch("tax-invoices/:id/issue")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:write")
  issueTaxInvoice(@Param("id") id: string) { return this.financeV2Service.issueTaxInvoice(id); }

  @Patch("tax-invoices/:id/cancel")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:write")
  cancelTaxInvoice(@Param("id") id: string) { return this.financeV2Service.cancelTaxInvoice(id); }

  // Tax withholding
  @Post("withholding")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:write")
  createWithholding(@Body() dto: any) { return this.financeV2Service.createWithholding(dto); }

  @Get("withholding")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:read")
  getWithholdings(@Query("staff_id") staffId?: string, @Query("framework") framework?: string) {
    return this.financeV2Service.getWithholdings(staffId, framework);
  }

  @Patch("withholding/:id/remit")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:write")
  markRemitted(@Param("id") id: string, @Body() dto: { reference: string }) {
    return this.financeV2Service.markWithholdingRemitted(id, dto.reference);
  }

  // Fee structure versions
  @Post("fee-structure-versions")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:write")
  upsertFeeStructureVersion(@Body() dto: any) { return this.financeV2Service.upsertFeeStructureVersion(dto); }

  @Get("fee-structure-versions")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:read")
  getFeeStructureVersions(@Query("academic_year_id") academicYearId: string, @Query("class_id") classId?: string) {
    return this.financeV2Service.getFeeStructureVersions(academicYearId, classId);
  }

  // Export
  @Get("export")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("finance:read")
  exportLedger(@Query("academic_year_id") academicYearId: string, @Query("format") format?: string) {
    return this.financeV2Service.exportLedger(academicYearId, format);
  }
}
