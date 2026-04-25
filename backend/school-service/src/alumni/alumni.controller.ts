import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards } from "@nestjs/common";
import { AlumniService } from "./alumni.service";
import { JwtAuthGuard } from "@xceliqos/shared";
import { AlumniStatus, AlumniExitReason } from "@xceliqos/shared/src/entities/alumni-record.entity";

@Controller("alumni")
@UseGuards(JwtAuthGuard)
export class AlumniController {
  constructor(private readonly service: AlumniService) {}

  // ── Config ──────────────────────────────────────────────────────────────

  @Get("config")
  getConfig(@Req() req: any) {
    return this.service.getConfig(req.user.school_id);
  }

  @Patch("config")
  updateConfig(@Req() req: any, @Body() dto: any) {
    return this.service.updateConfig(req.user.school_id, dto, req.user.user_id);
  }

  // ── Records ──────────────────────────────────────────────────────────────

  @Get()
  listRecords(@Req() req: any) {
    return this.service.listRecords(req.user.school_id);
  }

  @Get(":id")
  getRecord(@Req() req: any, @Param("id") id: string) {
    return this.service.getRecord(req.user.school_id, id);
  }

  @Get("by-student/:student_id")
  getRecordByStudent(@Req() req: any, @Param("student_id") student_id: string) {
    return this.service.getRecordByStudent(req.user.school_id, student_id);
  }

  @Post()
  initiateAlumni(@Req() req: any, @Body() dto: {
    student_id: string;
    graduation_year?: number;
    exit_reason?: AlumniExitReason;
    house_group_id?: string;
  }) {
    return this.service.initiateAlumni(req.user.school_id, dto, req.user.user_id);
  }

  @Post(":id/parent-consent")
  recordParentConsent(@Req() req: any, @Param("id") id: string, @Body("consented") consented: boolean) {
    return this.service.recordParentConsent(req.user.school_id, id, consented, req.user.user_id);
  }

  @Post(":id/issue-invite")
  issueInviteCode(@Req() req: any, @Param("id") id: string) {
    return this.service.issueInviteCode(req.user.school_id, id, req.user.user_id);
  }

  @Post(":id/redeem")
  redeemInviteCode(@Req() req: any, @Param("id") id: string, @Body("invite_code") invite_code: string) {
    return this.service.redeemInviteCode(req.user.school_id, id, invite_code);
  }

  @Post(":id/opt-out")
  optOut(@Req() req: any, @Param("id") id: string, @Body("reason") reason: string) {
    return this.service.optOut(req.user.school_id, id, reason, req.user.user_id);
  }

  @Post(":id/suspend")
  suspend(@Req() req: any, @Param("id") id: string, @Body("reason") reason: string) {
    return this.service.suspend(req.user.school_id, id, reason, req.user.user_id);
  }

  @Patch(":id/career-pathway")
  updateCareerPathway(@Req() req: any, @Param("id") id: string, @Body() dto: any) {
    return this.service.updateCareerPathway(req.user.school_id, id, dto, req.user.user_id);
  }
}
