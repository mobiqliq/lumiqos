import { Controller, Get, Post, Patch, Body, Param, Req, Query, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { firstValueFrom } from "rxjs";

@Controller("reflect")
export class XceliQReflectController {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get("SCHOOL_SERVICE_HOST", "school-service");
    const port = this.configService.get("SCHOOL_SERVICE_PORT", "3000");
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  @Post("entries")
  createEntry(@Body() dto: any, @Req() req: Request) {
    return this.proxyPost("/reflect/entries", dto, req);
  }

  @Get("entries")
  listEntries(@Req() req: Request, @Query() query: any) {
    const qs = new URLSearchParams(query).toString();
    return this.proxyGet(`/reflect/entries${qs ? "?" + qs : ""}`, req);
  }

  @Get("entries/:id")
  getEntry(@Param("id") id: string, @Req() req: Request) {
    return this.proxyGet(`/reflect/entries/${id}`, req);
  }

  @Post("entries/:id/ai-feedback")
  addAiFeedback(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/reflect/entries/${id}/ai-feedback`, dto, req);
  }

  @Post("scores")
  createScore(@Body() dto: any, @Req() req: Request) {
    return this.proxyPost("/reflect/scores", dto, req);
  }

  @Get("scores/:student_id")
  getScoresByStudent(@Param("student_id") student_id: string, @Req() req: Request, @Query() query: any) {
    const qs = new URLSearchParams(query).toString();
    return this.proxyGet(`/reflect/scores/${student_id}${qs ? "?" + qs : ""}`, req);
  }

  @Patch("scores/:id")
  updateScore(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/reflect/scores/${id}`, dto, req);
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
