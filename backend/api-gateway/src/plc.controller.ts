import { Controller, Get, Post, Patch, Delete, Body, Param, Req, Query, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { firstValueFrom } from "rxjs";

@Controller("plc")
export class PLCController {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get("SCHOOL_SERVICE_HOST", "school-service");
    const port = this.configService.get("SCHOOL_SERVICE_PORT", "3000");
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  // ── Groups ───────────────────────────────────────────────────────────────

  @Post("groups")
  createGroup(@Body() dto: any, @Req() req: Request) {
    return this.proxyPost("/plc/groups", dto, req);
  }

  @Get("groups")
  listGroups(@Req() req: Request, @Query() query: any) {
    const qs = new URLSearchParams(query).toString();
    return this.proxyGet(`/plc/groups${qs ? "?" + qs : ""}`, req);
  }

  @Get("groups/:id")
  getGroup(@Param("id") id: string, @Req() req: Request) {
    return this.proxyGet(`/plc/groups/${id}`, req);
  }

  @Patch("groups/:id")
  updateGroup(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/plc/groups/${id}`, dto, req);
  }

  @Delete("groups/:id")
  deleteGroup(@Param("id") id: string, @Req() req: Request) {
    return this.proxyDelete(`/plc/groups/${id}`, req);
  }

  // ── Sessions ─────────────────────────────────────────────────────────────

  @Post("sessions")
  createSession(@Body() dto: any, @Req() req: Request) {
    return this.proxyPost("/plc/sessions", dto, req);
  }

  @Get("sessions")
  listSessions(@Req() req: Request, @Query() query: any) {
    const qs = new URLSearchParams(query).toString();
    return this.proxyGet(`/plc/sessions${qs ? "?" + qs : ""}`, req);
  }

  @Get("sessions/:id")
  getSession(@Param("id") id: string, @Req() req: Request) {
    return this.proxyGet(`/plc/sessions/${id}`, req);
  }

  @Patch("sessions/:id")
  updateSession(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/plc/sessions/${id}`, dto, req);
  }

  @Delete("sessions/:id")
  deleteSession(@Param("id") id: string, @Req() req: Request) {
    return this.proxyDelete(`/plc/sessions/${id}`, req);
  }

  // ── Resources ────────────────────────────────────────────────────────────

  @Post("resources")
  createResource(@Body() dto: any, @Req() req: Request) {
    return this.proxyPost("/plc/resources", dto, req);
  }

  @Get("resources")
  listResources(@Req() req: Request, @Query() query: any) {
    const qs = new URLSearchParams(query).toString();
    return this.proxyGet(`/plc/resources${qs ? "?" + qs : ""}`, req);
  }

  @Get("resources/:id")
  getResource(@Param("id") id: string, @Req() req: Request) {
    return this.proxyGet(`/plc/resources/${id}`, req);
  }

  @Patch("resources/:id")
  updateResource(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/plc/resources/${id}`, dto, req);
  }

  @Delete("resources/:id")
  deleteResource(@Param("id") id: string, @Req() req: Request) {
    return this.proxyDelete(`/plc/resources/${id}`, req);
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

  private async proxyDelete(path: string, req: Request) {
    try {
      const headers = { "x-school-id": req.headers["x-school-id"] || "", "authorization": req.headers["authorization"] || "" };
      const r = await firstValueFrom(this.httpService.delete(`${this.schoolServiceUrl}${path}`, { headers }));
      return r.data;
    } catch (e) { throw new HttpException(e.response?.data || e.message, e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR); }
  }
}
