import { Controller, Get, Post, Patch, Body, Param, Req, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { firstValueFrom } from "rxjs";

@Controller("alumni")
export class AlumniController {
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
  getConfig(@Req() req: Request) {
    return this.proxyGet("/alumni/config", req);
  }

  @Patch("config")
  updateConfig(@Body() dto: any, @Req() req: Request) {
    return this.proxyPatch("/alumni/config", dto, req);
  }

  @Get()
  listRecords(@Req() req: Request) {
    return this.proxyGet("/alumni", req);
  }

  @Get("by-student/:student_id")
  getRecordByStudent(@Param("student_id") student_id: string, @Req() req: Request) {
    return this.proxyGet(`/alumni/by-student/${student_id}`, req);
  }

  @Get(":id")
  getRecord(@Param("id") id: string, @Req() req: Request) {
    return this.proxyGet(`/alumni/${id}`, req);
  }

  @Post()
  initiateAlumni(@Body() dto: any, @Req() req: Request) {
    return this.proxyPost("/alumni", dto, req);
  }

  @Post(":id/parent-consent")
  recordParentConsent(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/alumni/${id}/parent-consent`, dto, req);
  }

  @Post(":id/issue-invite")
  issueInviteCode(@Param("id") id: string, @Req() req: Request) {
    return this.proxyPost(`/alumni/${id}/issue-invite`, {}, req);
  }

  @Post(":id/redeem")
  redeemInviteCode(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/alumni/${id}/redeem`, dto, req);
  }

  @Post(":id/opt-out")
  optOut(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/alumni/${id}/opt-out`, dto, req);
  }

  @Post(":id/suspend")
  suspend(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/alumni/${id}/suspend`, dto, req);
  }

  @Patch(":id/career-pathway")
  updateCareerPathway(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/alumni/${id}/career-pathway`, dto, req);
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
