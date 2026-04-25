import { Controller, Get, Post, Patch, Body, Param, Query, Req, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { firstValueFrom } from "rxjs";

@Controller("portfolio")
export class PortfolioController {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get("SCHOOL_SERVICE_HOST", "school-service");
    const port = this.configService.get("SCHOOL_SERVICE_PORT", "3000");
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  @Get("config")
  getConfig(@Query("school_id") schoolId: string, @Req() req: Request) {
    return this.proxyGet(`/portfolio/config?school_id=${schoolId}`, req);
  }

  @Post("config")
  upsertConfig(@Query("school_id") schoolId: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/portfolio/config?school_id=${schoolId}`, dto, req);
  }

  @Get()
  getPortfolios(@Query("school_id") schoolId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyGet(`/portfolio?school_id=${schoolId}&academic_year_id=${ayId}`, req);
  }

  @Get("items/pending-approvals")
  getPendingApprovals(@Query("school_id") schoolId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyGet(`/portfolio/items/pending-approvals?school_id=${schoolId}&academic_year_id=${ayId}`, req);
  }

  @Get(":studentId")
  getPortfolio(@Query("school_id") schoolId: string, @Param("studentId") studentId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyGet(`/portfolio/${studentId}?school_id=${schoolId}&academic_year_id=${ayId}`, req);
  }

  @Patch(":id")
  updatePortfolio(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/portfolio/${id}?school_id=${schoolId}`, dto, req);
  }

  @Post(":id/enable-self-curation")
  enableSelfCuration(@Query("school_id") schoolId: string, @Param("id") id: string, @Req() req: Request) {
    return this.proxyPost(`/portfolio/${id}/enable-self-curation?school_id=${schoolId}`, {}, req);
  }

  @Post(":id/share-token")
  generateShareToken(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/portfolio/${id}/share-token?school_id=${schoolId}`, dto, req);
  }

  @Post(":portfolioId/items")
  addItem(@Query("school_id") schoolId: string, @Param("portfolioId") portfolioId: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/portfolio/${portfolioId}/items?school_id=${schoolId}`, dto, req);
  }

  @Get(":portfolioId/items")
  getItems(@Query("school_id") schoolId: string, @Param("portfolioId") portfolioId: string, @Query("include_non_approved") includeNonApproved: string, @Req() req: Request) {
    const q = `school_id=${schoolId}${includeNonApproved ? "&include_non_approved=" + includeNonApproved : ""}`;
    return this.proxyGet(`/portfolio/${portfolioId}/items?${q}`, req);
  }

  @Patch("items/:id")
  updateItem(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/portfolio/items/${id}?school_id=${schoolId}`, dto, req);
  }

  @Post("items/:id/submit")
  submitItemForApproval(@Query("school_id") schoolId: string, @Param("id") id: string, @Req() req: Request) {
    return this.proxyPost(`/portfolio/items/${id}/submit?school_id=${schoolId}`, {}, req);
  }

  @Post("items/:id/approve")
  approveItem(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/portfolio/items/${id}/approve?school_id=${schoolId}`, dto, req);
  }

  @Post("items/:id/reject")
  rejectItem(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/portfolio/items/${id}/reject?school_id=${schoolId}`, dto, req);
  }

  private async proxyGet(path: string, req: Request) {
    try {
      const headers = { "x-school-id": req.headers["x-school-id"] || "", "authorization": req.headers["authorization"] || "" };
      const r = await firstValueFrom(this.httpService.get(`${this.schoolServiceUrl}${path}`, { headers }));
      return r.data;
    } catch (e) { throw new HttpException(e.response?.data || e.message, e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR); }
  }

  private async proxyPost(path: string, body: any, req: Request) {
    try {
      const headers = { "x-school-id": req.headers["x-school-id"] || "", "authorization": req.headers["authorization"] || "" };
      const r = await firstValueFrom(this.httpService.post(`${this.schoolServiceUrl}${path}`, body, { headers }));
      return r.data;
    } catch (e) { throw new HttpException(e.response?.data || e.message, e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR); }
  }

  private async proxyPatch(path: string, body: any, req: Request) {
    try {
      const headers = { "x-school-id": req.headers["x-school-id"] || "", "authorization": req.headers["authorization"] || "" };
      const r = await firstValueFrom(this.httpService.patch(`${this.schoolServiceUrl}${path}`, body, { headers }));
      return r.data;
    } catch (e) { throw new HttpException(e.response?.data || e.message, e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR); }
  }
}
