import { Controller, Get, Post, Patch, Body, Param, Query, Req, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { firstValueFrom } from "rxjs";

@Controller("operations")
export class OperationsController {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get("SCHOOL_SERVICE_HOST", "school-service");
    const port = this.configService.get("SCHOOL_SERVICE_PORT", "3000");
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  // ── Config ────────────────────────────────────────────────────────────────

  @Get("config")
  getConfig(@Query("school_id") schoolId: string, @Req() req: Request) {
    return this.proxyGet(`/operations/config?school_id=${schoolId}`, req);
  }

  @Patch("config")
  upsertConfig(@Query("school_id") schoolId: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/operations/config?school_id=${schoolId}`, dto, req);
  }

  // ── Library ───────────────────────────────────────────────────────────────

  @Post("library/books")
  addBook(@Query("school_id") schoolId: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/operations/library/books?school_id=${schoolId}`, dto, req);
  }

  @Get("library/books")
  searchBooks(@Query("school_id") schoolId: string, @Query() query: any, @Req() req: Request) {
    const q = new URLSearchParams(query).toString();
    return this.proxyGet(`/operations/library/books?${q}`, req);
  }

  @Get("library/books/:id")
  getBook(@Query("school_id") schoolId: string, @Param("id") id: string, @Req() req: Request) {
    return this.proxyGet(`/operations/library/books/${id}?school_id=${schoolId}`, req);
  }

  @Post("library/books/:id/issue")
  issueBook(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/operations/library/books/${id}/issue?school_id=${schoolId}`, dto, req);
  }

  @Post("library/books/:id/return")
  returnBook(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/operations/library/books/${id}/return?school_id=${schoolId}`, dto, req);
  }

  @Post("library/books/:id/renew")
  renewBook(@Query("school_id") schoolId: string, @Param("id") id: string, @Req() req: Request) {
    return this.proxyPost(`/operations/library/books/${id}/renew?school_id=${schoolId}`, {}, req);
  }

  @Post("library/books/:id/pay-fine")
  payFine(@Query("school_id") schoolId: string, @Param("id") id: string, @Req() req: Request) {
    return this.proxyPost(`/operations/library/books/${id}/pay-fine?school_id=${schoolId}`, {}, req);
  }

  // ── Transport Routes ──────────────────────────────────────────────────────

  @Post("transport/routes")
  createRoute(@Query("school_id") schoolId: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/operations/transport/routes?school_id=${schoolId}`, dto, req);
  }

  @Get("transport/routes")
  getRoutes(@Query("school_id") schoolId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    const q = `school_id=${schoolId}${ayId ? "&academic_year_id=" + ayId : ""}`;
    return this.proxyGet(`/operations/transport/routes?${q}`, req);
  }

  @Get("transport/routes/:id")
  getRoute(@Query("school_id") schoolId: string, @Param("id") id: string, @Req() req: Request) {
    return this.proxyGet(`/operations/transport/routes/${id}?school_id=${schoolId}`, req);
  }

  @Patch("transport/routes/:id")
  updateRoute(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/operations/transport/routes/${id}?school_id=${schoolId}`, dto, req);
  }

  // ── Transport Assignments ─────────────────────────────────────────────────

  @Post("transport/assignments")
  assignStudent(@Query("school_id") schoolId: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/operations/transport/assignments?school_id=${schoolId}`, dto, req);
  }

  @Get("transport/assignments")
  getAssignments(@Query("school_id") schoolId: string, @Query("route_id") routeId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    const q = [`school_id=${schoolId}`, routeId ? `route_id=${routeId}` : "", ayId ? `academic_year_id=${ayId}` : ""].filter(Boolean).join("&");
    return this.proxyGet(`/operations/transport/assignments?${q}`, req);
  }

  @Get("transport/assignments/student/:studentId")
  getStudentAssignment(@Query("school_id") schoolId: string, @Param("studentId") studentId: string, @Query("academic_year_id") ayId: string, @Req() req: Request) {
    return this.proxyGet(`/operations/transport/assignments/student/${studentId}?school_id=${schoolId}&academic_year_id=${ayId}`, req);
  }

  // ── Visitor Log ───────────────────────────────────────────────────────────

  @Post("visitors/check-in")
  checkIn(@Query("school_id") schoolId: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/operations/visitors/check-in?school_id=${schoolId}`, dto, req);
  }

  @Patch("visitors/:id/check-out")
  checkOut(@Query("school_id") schoolId: string, @Param("id") id: string, @Req() req: Request) {
    return this.proxyPatch(`/operations/visitors/${id}/check-out?school_id=${schoolId}`, {}, req);
  }

  @Get("visitors")
  getVisitorLogs(@Query("school_id") schoolId: string, @Query() query: any, @Req() req: Request) {
    const q = new URLSearchParams(query).toString();
    return this.proxyGet(`/operations/visitors?${q}`, req);
  }

  @Get("visitors/active")
  getActiveVisitors(@Query("school_id") schoolId: string, @Req() req: Request) {
    return this.proxyGet(`/operations/visitors/active?school_id=${schoolId}`, req);
  }

  @Patch("visitors/:id/flag")
  flagVisitor(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/operations/visitors/${id}/flag?school_id=${schoolId}`, dto, req);
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
