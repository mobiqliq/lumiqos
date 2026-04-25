import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { firstValueFrom } from "rxjs";

@Controller("school-groups")
export class SchoolGroupController {
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
    return this.proxyGet(`/school-groups/config`, req);
  }

  @Patch("config")
  updateConfig(@Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/school-groups/config`, dto, req);
  }

  @Post()
  createGroup(@Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/school-groups`, dto, req);
  }

  @Get()
  listGroups(
    @Query("group_type") group_type: string,
    @Query("academic_year_id") academic_year_id: string,
    @Req() req: Request,
  ) {
    const q = new URLSearchParams();
    if (group_type) q.set("group_type", group_type);
    if (academic_year_id) q.set("academic_year_id", academic_year_id);
    return this.proxyGet(`/school-groups?${q.toString()}`, req);
  }

  @Get(":id")
  getGroup(@Param("id") id: string, @Req() req: Request) {
    return this.proxyGet(`/school-groups/${id}`, req);
  }

  @Patch(":id")
  updateGroup(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/school-groups/${id}`, dto, req);
  }

  @Get(":id/subgroups")
  listSubgroups(@Param("id") id: string, @Req() req: Request) {
    return this.proxyGet(`/school-groups/${id}/subgroups`, req);
  }

  @Patch(":id/points")
  addPoints(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/school-groups/${id}/points`, dto, req);
  }

  @Post(":id/members")
  addMember(@Param("id") id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPost(`/school-groups/${id}/members`, dto, req);
  }

  @Get(":id/members")
  listMembers(@Param("id") id: string, @Req() req: Request) {
    return this.proxyGet(`/school-groups/${id}/members`, req);
  }

  @Patch(":id/members/:member_id/role")
  updateMemberRole(@Param("id") id: string, @Param("member_id") member_id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyPatch(`/school-groups/${id}/members/${member_id}/role`, dto, req);
  }

  @Delete(":id/members/:member_id")
  removeMember(@Param("id") id: string, @Param("member_id") member_id: string, @Body() dto: any, @Req() req: Request) {
    return this.proxyDelete(`/school-groups/${id}/members/${member_id}`, dto, req);
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

  private async proxyDelete(path: string, body: any, req: Request) {
    try {
      const headers = { "x-school-id": req.headers["x-school-id"] || "", "authorization": req.headers["authorization"] || "" };
      const r = await firstValueFrom(this.httpService.delete(`${this.schoolServiceUrl}${path}`, { headers, data: body }));
      return r.data;
    } catch (e) { throw new HttpException(e.response?.data || e.message, e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR); }
  }
}
