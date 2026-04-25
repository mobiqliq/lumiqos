import { Controller, Get, Post, Patch, Body, Param, Req, Query, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { firstValueFrom } from "rxjs";

@Controller("board-reports")
export class BoardReportingController {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get("SCHOOL_SERVICE_HOST", "school-service");
    const port = this.configService.get("SCHOOL_SERVICE_PORT", "3000");
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  @Post()
  generate(@Body() dto: any, @Req() req: Request) {
    return this.proxyPost("/board-reports", dto, req);
  }

  @Get()
  list(@Req() req: Request, @Query() query: any) {
    const qs = new URLSearchParams(query).toString();
    return this.proxyGet(`/board-reports${qs ? "?" + qs : ""}`, req);
  }

  @Get(":id")
  getOne(@Param("id") id: string, @Req() req: Request) {
    return this.proxyGet(`/board-reports/${id}`, req);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/board-reports/${id}`, dto, req);
  }

  @Patch(":id/publish")
  publish(@Param("id") id: string, @Req() req: Request) {
    return this.proxyPatch(`/board-reports/${id}/publish`, {}, req);
  }

  @Patch(":id/archive")
  archive(@Param("id") id: string, @Req() req: Request) {
    return this.proxyPatch(`/board-reports/${id}/archive`, {}, req);
  }

  @Post(":id/approve")
  approve(@Param("id") id: string, @Req() req: Request) {
    return this.proxyPost(`/board-reports/${id}/approve`, {}, req);
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
