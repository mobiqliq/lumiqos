import { Controller, Get, Post, Patch, Delete, Body, Param, Req, Query, UseGuards } from "@nestjs/common";
import { PLCService } from "./plc.service";
import { JwtAuthGuard } from "@xceliqos/shared";
import { PLCResourceType } from "@xceliqos/shared/src/entities/plc-resource.entity";

@Controller("plc")
@UseGuards(JwtAuthGuard)
export class PLCController {
  constructor(private readonly service: PLCService) {}

  // ── Groups ───────────────────────────────────────────────────────────────

  @Post("groups")
  createGroup(@Req() req: any, @Body() dto: any) {
    return this.service.createGroup(req.user.school_id, dto, req.user.user_id);
  }

  @Get("groups")
  listGroups(@Req() req: any, @Query("academic_year_id") academic_year_id?: string) {
    return this.service.listGroups(req.user.school_id, academic_year_id);
  }

  @Get("groups/:id")
  getGroup(@Req() req: any, @Param("id") id: string) {
    return this.service.getGroup(req.user.school_id, id);
  }

  @Patch("groups/:id")
  updateGroup(@Req() req: any, @Param("id") id: string, @Body() dto: any) {
    return this.service.updateGroup(req.user.school_id, id, dto, req.user.user_id);
  }

  @Delete("groups/:id")
  deleteGroup(@Req() req: any, @Param("id") id: string) {
    return this.service.deleteGroup(req.user.school_id, id);
  }

  // ── Sessions ─────────────────────────────────────────────────────────────

  @Post("sessions")
  createSession(@Req() req: any, @Body() dto: any) {
    return this.service.createSession(req.user.school_id, dto, req.user.user_id);
  }

  @Get("sessions")
  listSessions(@Req() req: any, @Query("plc_group_id") plc_group_id?: string) {
    return this.service.listSessions(req.user.school_id, plc_group_id);
  }

  @Get("sessions/:id")
  getSession(@Req() req: any, @Param("id") id: string) {
    return this.service.getSession(req.user.school_id, id);
  }

  @Patch("sessions/:id")
  updateSession(@Req() req: any, @Param("id") id: string, @Body() dto: any) {
    return this.service.updateSession(req.user.school_id, id, dto, req.user.user_id);
  }

  @Delete("sessions/:id")
  deleteSession(@Req() req: any, @Param("id") id: string) {
    return this.service.deleteSession(req.user.school_id, id);
  }

  // ── Resources ────────────────────────────────────────────────────────────

  @Post("resources")
  createResource(@Req() req: any, @Body() dto: any) {
    return this.service.createResource(req.user.school_id, dto, req.user.user_id);
  }

  @Get("resources")
  listResources(
    @Req() req: any,
    @Query("plc_group_id") plc_group_id?: string,
    @Query("resource_type") resource_type?: PLCResourceType,
  ) {
    return this.service.listResources(req.user.school_id, plc_group_id, resource_type);
  }

  @Get("resources/:id")
  getResource(@Req() req: any, @Param("id") id: string) {
    return this.service.getResource(req.user.school_id, id);
  }

  @Patch("resources/:id")
  updateResource(@Req() req: any, @Param("id") id: string, @Body() dto: any) {
    return this.service.updateResource(req.user.school_id, id, dto, req.user.user_id);
  }

  @Delete("resources/:id")
  deleteResource(@Req() req: any, @Param("id") id: string) {
    return this.service.deleteResource(req.user.school_id, id);
  }
}
