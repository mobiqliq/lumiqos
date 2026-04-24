import { Controller, Get, Post, Patch, Body, Param, Query, Req, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { firstValueFrom } from "rxjs";

@Controller("finance/v2")
export class FinanceV2Controller {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get("SCHOOL_SERVICE_HOST", "school-service");
    const port = this.configService.get("SCHOOL_SERVICE_PORT", "3000");
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  @Post("ledger")
  upsertLedger(@Body() dto: any, @Req() req: Request) { return this.proxyPost("/finance/v2/ledger", dto, req); }

  @Get("ledger")
  getLedger(@Query("academic_year_id") academicYearId: string, @Req() req: Request) {
    return this.proxyGet(`/finance/v2/ledger?academic_year_id=${academicYearId}`, req);
  }

  @Post("entries")
  createEntry(@Body() dto: any, @Req() req: Request) { return this.proxyPost("/finance/v2/entries", dto, req); }

  @Get("entries")
  getEntries(@Query("ledger_id") ledgerId: string, @Query("entry_type") entryType: string, @Req() req: Request) {
    const q = `ledger_id=${ledgerId}${entryType ? "&entry_type=" + entryType : ""}`;
    return this.proxyGet(`/finance/v2/entries?${q}`, req);
  }

  @Post("entries/:id/reverse")
  reverseEntry(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/finance/v2/entries/${id}/reverse`, dto, req);
  }

  @Post("tax-invoices")
  createTaxInvoice(@Body() dto: any, @Req() req: Request) { return this.proxyPost("/finance/v2/tax-invoices", dto, req); }

  @Get("tax-invoices")
  getTaxInvoices(@Query("status") status: string, @Query("framework") framework: string, @Req() req: Request) {
    const q = [status ? `status=${status}` : "", framework ? `framework=${framework}` : ""].filter(Boolean).join("&");
    return this.proxyGet(`/finance/v2/tax-invoices${q ? "?" + q : ""}`, req);
  }

  @Patch("tax-invoices/:id/issue")
  issueTaxInvoice(@Param("id") id: string, @Req() req: Request) { return this.proxyPatch(`/finance/v2/tax-invoices/${id}/issue`, {}, req); }

  @Patch("tax-invoices/:id/cancel")
  cancelTaxInvoice(@Param("id") id: string, @Req() req: Request) { return this.proxyPatch(`/finance/v2/tax-invoices/${id}/cancel`, {}, req); }

  @Post("withholding")
  createWithholding(@Body() dto: any, @Req() req: Request) { return this.proxyPost("/finance/v2/withholding", dto, req); }

  @Get("withholding")
  getWithholdings(@Query("staff_id") staffId: string, @Query("framework") framework: string, @Req() req: Request) {
    const q = [staffId ? `staff_id=${staffId}` : "", framework ? `framework=${framework}` : ""].filter(Boolean).join("&");
    return this.proxyGet(`/finance/v2/withholding${q ? "?" + q : ""}`, req);
  }

  @Patch("withholding/:id/remit")
  markRemitted(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/finance/v2/withholding/${id}/remit`, dto, req);
  }

  @Post("fee-structure-versions")
  upsertFeeStructureVersion(@Body() dto: any, @Req() req: Request) { return this.proxyPost("/finance/v2/fee-structure-versions", dto, req); }

  @Get("fee-structure-versions")
  getFeeStructureVersions(@Query("academic_year_id") academicYearId: string, @Query("class_id") classId: string, @Req() req: Request) {
    const q = `academic_year_id=${academicYearId}${classId ? "&class_id=" + classId : ""}`;
    return this.proxyGet(`/finance/v2/fee-structure-versions?${q}`, req);
  }

  @Get("export")
  exportLedger(@Query("academic_year_id") academicYearId: string, @Query("format") format: string, @Req() req: Request) {
    const q = `academic_year_id=${academicYearId}${format ? "&format=" + format : ""}`;
    return this.proxyGet(`/finance/v2/export?${q}`, req);
  }

  private async proxyGet(path: string, req: Request) {
    try {
      const headers = { "x-school-id": req.headers["x-school-id"] || "", "authorization": req.headers["authorization"] || "" };
      const response = await firstValueFrom(this.httpService.get(`${this.schoolServiceUrl}${path}`, { headers }));
      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || error.message, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async proxyPost(path: string, body: any, req: Request) {
    try {
      const headers = { "x-school-id": req.headers["x-school-id"] || "", "authorization": req.headers["authorization"] || "" };
      const response = await firstValueFrom(this.httpService.post(`${this.schoolServiceUrl}${path}`, body, { headers }));
      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || error.message, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async proxyPatch(path: string, body: any, req: Request) {
    try {
      const headers = { "x-school-id": req.headers["x-school-id"] || "", "authorization": req.headers["authorization"] || "" };
      const response = await firstValueFrom(this.httpService.patch(`${this.schoolServiceUrl}${path}`, body, { headers }));
      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || error.message, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
