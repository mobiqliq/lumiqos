import { Controller, Get, Post, Patch, Body, Param, Query, Req, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { firstValueFrom } from "rxjs";

@Controller("learning-dna")
export class LearningDNAController {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get("SCHOOL_SERVICE_HOST", "school-service");
    const port = this.configService.get("SCHOOL_SERVICE_PORT", "3000");
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  // ── Profiles ──────────────────────────────────────────────────────────────

  @Get("profiles")
  getProfiles(@Query("school_id") schoolId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyGet(`/learning-dna/profiles?school_id=${schoolId}&academic_year_id=${ayId}`, req);
  }

  @Get("profiles/summary")
  getClassDNASummary(@Query("school_id") schoolId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyGet(`/learning-dna/profiles/summary?school_id=${schoolId}&academic_year_id=${ayId}`, req);
  }

  @Get("profiles/:studentId")
  getProfile(@Query("school_id") schoolId: string, @Param("studentId") studentId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyGet(`/learning-dna/profiles/${studentId}?school_id=${schoolId}&academic_year_id=${ayId}`, req);
  }

  @Post("profiles/:studentId/recompute")
  recomputeProfile(@Query("school_id") schoolId: string, @Param("studentId") studentId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyPost(`/learning-dna/profiles/${studentId}/recompute?school_id=${schoolId}&academic_year_id=${ayId}`, {}, req);
  }

  @Patch("profiles/:id/approve-narrative")
  approveNarrative(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/learning-dna/profiles/${id}/approve-narrative?school_id=${schoolId}`, dto, req);
  }

  // ── Observations ──────────────────────────────────────────────────────────

  @Post("observations")
  addObservation(@Query("school_id") schoolId: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/learning-dna/observations?school_id=${schoolId}`, dto, req);
  }

  @Get("observations/:studentId")
  getObservations(@Query("school_id") schoolId: string, @Param("studentId") studentId: string, @Query("academic_year_id") ayId: string, @Query("dimension") dimension: string, @Req() req: Request) {
    const q = [`school_id=${schoolId}`, `academic_year_id=${ayId}`, dimension ? `dimension=${dimension}` : ""].filter(Boolean).join("&");
    return this.proxyGet(`/learning-dna/observations/${studentId}?${q}`, req);
  }

  // ── Chronobio ─────────────────────────────────────────────────────────────

  @Get("chronobio")
  getChronobioConfig(@Query("school_id") schoolId: string, @Query("student_id") studentId: string, @Req() req: Request) {
    const q = `school_id=${schoolId}${studentId ? "&student_id=" + studentId : ""}`;
    return this.proxyGet(`/learning-dna/chronobio?${q}`, req);
  }

  @Post("chronobio")
  upsertChronobioConfig(@Query("school_id") schoolId: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/learning-dna/chronobio?school_id=${schoolId}`, dto, req);
  }

  @Patch("chronobio/:id/approve")
  approveChronobioConfig(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/learning-dna/chronobio/${id}/approve?school_id=${schoolId}`, dto, req);
  }

  // ── Cognitive Load Rules ──────────────────────────────────────────────────

  @Post("cognitive-load-rules")
  createLoadRule(@Query("school_id") schoolId: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/learning-dna/cognitive-load-rules?school_id=${schoolId}`, dto, req);
  }

  @Get("cognitive-load-rules")
  getLoadRules(@Query("school_id") schoolId: string, @Req() req: Request) {
    return this.proxyGet(`/learning-dna/cognitive-load-rules?school_id=${schoolId}`, req);
  }

  @Patch("cognitive-load-rules/:id")
  updateLoadRule(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/learning-dna/cognitive-load-rules/${id}?school_id=${schoolId}`, dto, req);
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
