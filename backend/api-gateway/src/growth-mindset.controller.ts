import { Controller, Get, Post, Patch, Body, Param, Req, Query, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { firstValueFrom } from "rxjs";

@Controller("mindset")
export class GrowthMindsetController {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get("SCHOOL_SERVICE_HOST", "school-service");
    const port = this.configService.get("SCHOOL_SERVICE_PORT", "3000");
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  @Post("moments")
  createMoment(@Body() dto: any, @Req() req: Request) {
    return this.proxyPost("/mindset/moments", dto, req);
  }

  @Get("moments/:student_id")
  listMoments(@Param("student_id") student_id: string, @Req() req: Request, @Query() query: any) {
    const qs = new URLSearchParams(query).toString();
    return this.proxyGet(`/mindset/moments/${student_id}${qs ? "?" + qs : ""}`, req);
  }

  @Patch("moments/:id")
  updateMoment(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/mindset/moments/${id}`, dto, req);
  }

  @Post("moments/:id/share-with-parent")
  shareWithParent(@Param("id") id: string, @Req() req: Request) {
    return this.proxyPost(`/mindset/moments/${id}/share-with-parent`, {}, req);
  }

  @Get("parent-progress/:student_id")
  getParentProgress(@Param("student_id") student_id: string, @Req() req: Request, @Query() query: any) {
    const qs = new URLSearchParams(query).toString();
    return this.proxyGet(`/mindset/parent-progress/${student_id}${qs ? "?" + qs : ""}`, req);
  }

  @Post("parent-progress")
  upsertParentProgress(@Body() dto: any, @Req() req: Request) {
    return this.proxyPost("/mindset/parent-progress", dto, req);
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
