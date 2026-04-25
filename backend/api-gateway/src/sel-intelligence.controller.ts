import { Controller, Get, Post, Patch, Body, Param, Query, Req, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { firstValueFrom } from "rxjs";

@Controller("sel-intelligence")
export class SELIntelligenceController {
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
  getFrameworkConfig(@Query("school_id") schoolId: string, @Req() req: Request) {
    return this.proxyGet(`/sel-intelligence/config?school_id=${schoolId}`, req);
  }

  @Post("config")
  upsertFrameworkConfig(@Query("school_id") schoolId: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/sel-intelligence/config?school_id=${schoolId}`, dto, req);
  }

  @Get("profiles")
  getProfiles(@Query("school_id") schoolId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyGet(`/sel-intelligence/profiles?school_id=${schoolId}&academic_year_id=${ayId}`, req);
  }

  @Get("profiles/summary")
  getClassSELSummary(@Query("school_id") schoolId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyGet(`/sel-intelligence/profiles/summary?school_id=${schoolId}&academic_year_id=${ayId}`, req);
  }

  @Get("profiles/:studentId")
  getProfile(@Query("school_id") schoolId: string, @Param("studentId") studentId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyGet(`/sel-intelligence/profiles/${studentId}?school_id=${schoolId}&academic_year_id=${ayId}`, req);
  }

  @Post("profiles/:studentId/recompute")
  recomputeProfile(@Query("school_id") schoolId: string, @Param("studentId") studentId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyPost(`/sel-intelligence/profiles/${studentId}/recompute?school_id=${schoolId}&academic_year_id=${ayId}`, {}, req);
  }

  @Patch("profiles/:id/approve-narrative")
  approveNarrative(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/sel-intelligence/profiles/${id}/approve-narrative?school_id=${schoolId}`, dto, req);
  }

  @Post("observations")
  addObservation(@Query("school_id") schoolId: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/sel-intelligence/observations?school_id=${schoolId}`, dto, req);
  }

  @Get("observations/:studentId")
  getObservations(@Query("school_id") schoolId: string, @Param("studentId") studentId: string, @Query("academic_year_id") ayId: string, @Query("competency") competency: string, @Req() req: Request) {
    const q = [`school_id=${schoolId}`, `academic_year_id=${ayId}`, competency ? `competency=${competency}` : ""].filter(Boolean).join("&");
    return this.proxyGet(`/sel-intelligence/observations/${studentId}?${q}`, req);
  }

  @Post("flow-state")
  logFlowState(@Query("school_id") schoolId: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/sel-intelligence/flow-state?school_id=${schoolId}`, dto, req);
  }

  @Get("flow-state/:studentId")
  getFlowLogs(@Query("school_id") schoolId: string, @Param("studentId") studentId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyGet(`/sel-intelligence/flow-state/${studentId}?school_id=${schoolId}&academic_year_id=${ayId}`, req);
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
