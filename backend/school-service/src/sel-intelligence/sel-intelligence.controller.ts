import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common";
import { SELIntelligenceService } from "./sel-intelligence.service";
import { JwtAuthGuard } from "@xceliqos/shared";
import { RbacGuard } from "@xceliqos/shared";
import { RequirePermissions } from "@xceliqos/shared";

@Controller("sel-intelligence")
export class SELIntelligenceController {
  constructor(private readonly selService: SELIntelligenceService) {}

  // ── Framework Config ──────────────────────────────────────────────────────

  @Get("config")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getFrameworkConfig(@Query("school_id") schoolId: string) {
    return this.selService.getFrameworkConfig(schoolId);
  }

  @Post("config")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  upsertFrameworkConfig(@Query("school_id") schoolId: string, @Body() dto: any) {
    return this.selService.upsertFrameworkConfig(schoolId, dto);
  }

  // ── EQ Profiles ───────────────────────────────────────────────────────────

  @Get("profiles")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getProfiles(@Query("school_id") schoolId: string, @Query("academic_year_id") ayId: string) {
    return this.selService.getProfiles(schoolId, ayId);
  }

  @Get("profiles/summary")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getClassSELSummary(@Query("school_id") schoolId: string, @Query("academic_year_id") ayId: string) {
    return this.selService.getClassSELSummary(schoolId, ayId);
  }

  @Get("profiles/:studentId")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getProfile(
    @Query("school_id") schoolId: string,
    @Param("studentId") studentId: string,
    @Query("academic_year_id") ayId: string,
  ) {
    return this.selService.getOrCreateProfile(schoolId, studentId, ayId);
  }

  @Post("profiles/:studentId/recompute")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  recomputeProfile(
    @Query("school_id") schoolId: string,
    @Param("studentId") studentId: string,
    @Query("academic_year_id") ayId: string,
  ) {
    return this.selService.recomputeProfile(schoolId, studentId, ayId);
  }

  @Patch("profiles/:id/approve-narrative")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  approveNarrative(
    @Query("school_id") schoolId: string,
    @Param("id") id: string,
    @Body() dto: { reviewer_id: string },
  ) {
    return this.selService.approveNarrative(schoolId, id, dto.reviewer_id);
  }

  // ── Observations ──────────────────────────────────────────────────────────

  @Post("observations")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  addObservation(@Query("school_id") schoolId: string, @Body() dto: any) {
    return this.selService.addObservation(schoolId, dto);
  }

  @Get("observations/:studentId")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getObservations(
    @Query("school_id") schoolId: string,
    @Param("studentId") studentId: string,
    @Query("academic_year_id") ayId: string,
    @Query("competency") competency?: string,
  ) {
    return this.selService.getObservations(schoolId, studentId, ayId, competency);
  }

  // ── Flow State ────────────────────────────────────────────────────────────

  @Post("flow-state")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  logFlowState(@Query("school_id") schoolId: string, @Body() dto: any) {
    return this.selService.logFlowState(schoolId, dto);
  }

  @Get("flow-state/:studentId")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getFlowLogs(
    @Query("school_id") schoolId: string,
    @Param("studentId") studentId: string,
    @Query("academic_year_id") ayId: string,
  ) {
    return this.selService.getFlowLogs(schoolId, studentId, ayId);
  }
}
