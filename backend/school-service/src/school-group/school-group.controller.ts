import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from "@nestjs/common";
import { SchoolGroupService } from "./school-group.service";
import { JwtAuthGuard } from "@xceliqos/shared";
import { SchoolGroupType } from "@xceliqos/shared/src/entities/school-group.entity";
import { SchoolGroupMemberRole } from "@xceliqos/shared/src/entities/school-group-member.entity";

@Controller("school-groups")
@UseGuards(JwtAuthGuard)
export class SchoolGroupController {
  constructor(private readonly service: SchoolGroupService) {}

  // ── Config ──────────────────────────────────────────────────────────────

  @Get("config")
  getConfig(@Req() req: any) {
    return this.service.getConfig(req.user.school_id);
  }

  @Patch("config")
  updateConfig(@Req() req: any, @Body() dto: any) {
    return this.service.updateConfig(req.user.school_id, dto);
  }

  // ── Groups ───────────────────────────────────────────────────────────────

  @Post()
  createGroup(@Req() req: any, @Body() dto: any) {
    return this.service.createGroup(req.user.school_id, dto, req.user.user_id);
  }

  @Get()
  listGroups(
    @Req() req: any,
    @Query("group_type") group_type?: SchoolGroupType,
    @Query("academic_year_id") academic_year_id?: string,
  ) {
    return this.service.listGroups(req.user.school_id, group_type, academic_year_id);
  }

  @Get(":id")
  getGroup(@Req() req: any, @Param("id") id: string) {
    return this.service.getGroup(req.user.school_id, id);
  }

  @Patch(":id")
  updateGroup(@Req() req: any, @Param("id") id: string, @Body() dto: any) {
    return this.service.updateGroup(req.user.school_id, id, dto, req.user.user_id);
  }

  @Get(":id/subgroups")
  listSubgroups(@Req() req: any, @Param("id") id: string) {
    return this.service.listSubgroups(req.user.school_id, id);
  }

  @Patch(":id/points")
  addPoints(@Req() req: any, @Param("id") id: string, @Body("points") points: number) {
    return this.service.addPoints(req.user.school_id, id, points, req.user.user_id);
  }

  // ── Members ──────────────────────────────────────────────────────────────

  @Post(":id/members")
  addMember(@Req() req: any, @Param("id") group_id: string, @Body() dto: any) {
    return this.service.addMember(req.user.school_id, group_id, dto, req.user.user_id);
  }

  @Get(":id/members")
  listMembers(@Req() req: any, @Param("id") group_id: string) {
    return this.service.listMembers(req.user.school_id, group_id);
  }

  @Patch(":id/members/:member_id/role")
  updateMemberRole(
    @Req() req: any,
    @Param("id") group_id: string,
    @Param("member_id") member_id: string,
    @Body("role") role: SchoolGroupMemberRole,
  ) {
    return this.service.updateMemberRole(req.user.school_id, group_id, member_id, role, req.user.user_id);
  }

  @Delete(":id/members/:member_id")
  removeMember(
    @Req() req: any,
    @Param("id") group_id: string,
    @Param("member_id") member_id: string,
    @Body("exit_reason") exit_reason: string,
  ) {
    return this.service.removeMember(req.user.school_id, group_id, member_id, exit_reason, req.user.user_id);
  }
}
