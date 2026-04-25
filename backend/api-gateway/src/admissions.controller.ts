import { Controller, Get, Post, Patch, Body, Param, Query, Req, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { firstValueFrom } from "rxjs";

@Controller("admissions")
export class AdmissionsController {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get("SCHOOL_SERVICE_HOST", "school-service");
    const port = this.configService.get("SCHOOL_SERVICE_PORT", "3000");
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  @Get("pipeline/summary")
  getPipelineSummary(@Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyGet(`/admissions/pipeline/summary?academic_year_id=${ayId}`, req);
  }

  @Post("applications")
  createApplication(@Body() dto: any, @Req() req: Request) { return this.proxyPost("/admissions/applications", dto, req); }

  @Get("applications")
  getApplications(@Query("stage") stage: string, @Query("academic_year_id") ayId: string, @Query("class_id") classId: string, @Req() req: Request) {
    const q = [stage ? `stage=${stage}` : "", ayId ? `academic_year_id=${ayId}` : "", classId ? `class_id=${classId}` : ""].filter(Boolean).join("&");
    return this.proxyGet(`/admissions/applications${q ? "?" + q : ""}`, req);
  }

  @Get("applications/:id")
  getApplication(@Param("id") id: string, @Req() req: Request) { return this.proxyGet(`/admissions/applications/${id}`, req); }

  @Patch("applications/:id/stage")
  advanceStage(@Param("id") id: string, @Body() dto: any, @Req() req: Request) { return this.proxyPatch(`/admissions/applications/${id}/stage`, dto, req); }

  @Post("applications/:id/offer")
  recordOffer(@Param("id") id: string, @Body() dto: any, @Req() req: Request) { return this.proxyPost(`/admissions/applications/${id}/offer`, dto, req); }

  @Post("applications/:id/offer/respond")
  respondToOffer(@Param("id") id: string, @Body() dto: any, @Req() req: Request) { return this.proxyPost(`/admissions/applications/${id}/offer/respond`, dto, req); }

  @Post("applications/:id/documents")
  addDocument(@Param("id") id: string, @Body() dto: any, @Req() req: Request) { return this.proxyPost(`/admissions/applications/${id}/documents`, dto, req); }

  @Patch("documents/:id/verify")
  verifyDocument(@Param("id") id: string, @Body() dto: any, @Req() req: Request) { return this.proxyPatch(`/admissions/documents/${id}/verify`, dto, req); }

  @Post("waitlist")
  addToWaitlist(@Body() dto: any, @Req() req: Request) { return this.proxyPost("/admissions/waitlist", dto, req); }

  @Get("waitlist")
  getWaitlist(@Query("academic_year_id") ayId: string, @Query("class_id") classId: string, @Req() req: Request) {
    const q = `academic_year_id=${ayId}${classId ? "&class_id=" + classId : ""}`;
    return this.proxyGet(`/admissions/waitlist?${q}`, req);
  }

  @Patch("waitlist/:id/respond")
  respondToWaitlistOffer(@Param("id") id: string, @Body() dto: any, @Req() req: Request) { return this.proxyPatch(`/admissions/waitlist/${id}/respond`, dto, req); }

  @Post("reservations")
  upsertReservationConfig(@Body() dto: any, @Req() req: Request) { return this.proxyPost("/admissions/reservations", dto, req); }

  @Get("reservations")
  getReservationConfigs(@Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyGet(`/admissions/reservations?academic_year_id=${ayId}`, req);
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
