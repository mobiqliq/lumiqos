import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common";
import { LearningDNAService } from "./learning-dna.service";
import { JwtAuthGuard } from "@xceliqos/shared";
import { RbacGuard } from "@xceliqos/shared";
import { RequirePermissions } from "@xceliqos/shared";

@Controller("learning-dna")
export class LearningDNAController {
  constructor(private readonly learningDNAService: LearningDNAService) {}

  // ── Profiles ──────────────────────────────────────────────────────────────

  @Get("profiles")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getProfiles(
    @Query("school_id") schoolId: string,
    @Query("academic_year_id") academicYearId: string,
  ) {
    return this.learningDNAService.getProfiles(schoolId, academicYearId);
  }

  @Get("profiles/summary")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getClassDNASummary(
    @Query("school_id") schoolId: string,
    @Query("academic_year_id") academicYearId: string,
  ) {
    return this.learningDNAService.getClassDNASummary(schoolId, academicYearId);
  }

  @Get("profiles/:studentId")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getProfile(
    @Query("school_id") schoolId: string,
    @Param("studentId") studentId: string,
    @Query("academic_year_id") academicYearId: string,
  ) {
    return this.learningDNAService.getOrCreateProfile(schoolId, studentId, academicYearId);
  }

  @Post("profiles/:studentId/recompute")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  recomputeProfile(
    @Query("school_id") schoolId: string,
    @Param("studentId") studentId: string,
    @Query("academic_year_id") academicYearId: string,
  ) {
    return this.learningDNAService.recomputeProfile(schoolId, studentId, academicYearId);
  }

  @Patch("profiles/:id/approve-narrative")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  approveNarrative(
    @Query("school_id") schoolId: string,
    @Param("id") id: string,
    @Body() dto: { reviewer_id: string },
  ) {
    return this.learningDNAService.approveNarrative(schoolId, id, dto.reviewer_id);
  }

  // ── Observations ──────────────────────────────────────────────────────────

  @Post("observations")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  addObservation(@Query("school_id") schoolId: string, @Body() dto: any) {
    return this.learningDNAService.addObservation(schoolId, dto);
  }

  @Get("observations/:studentId")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getObservations(
    @Query("school_id") schoolId: string,
    @Param("studentId") studentId: string,
    @Query("academic_year_id") academicYearId: string,
    @Query("dimension") dimension?: string,
  ) {
    return this.learningDNAService.getObservations(schoolId, studentId, academicYearId, dimension);
  }

  // ── Chronobio ─────────────────────────────────────────────────────────────

  @Get("chronobio")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getChronobioConfig(
    @Query("school_id") schoolId: string,
    @Query("student_id") studentId?: string,
  ) {
    return this.learningDNAService.getChronobioConfig(schoolId, studentId);
  }

  @Post("chronobio")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  upsertChronobioConfig(@Query("school_id") schoolId: string, @Body() dto: any) {
    return this.learningDNAService.upsertChronobioConfig(schoolId, dto);
  }

  @Patch("chronobio/:id/approve")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  approveChronobioConfig(
    @Query("school_id") schoolId: string,
    @Param("id") id: string,
    @Body() dto: { approver_id: string },
  ) {
    return this.learningDNAService.approveChronobioConfig(schoolId, id, dto.approver_id);
  }

  // ── Cognitive Load Rules ──────────────────────────────────────────────────

  @Post("cognitive-load-rules")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  createLoadRule(@Query("school_id") schoolId: string, @Body() dto: any) {
    return this.learningDNAService.createLoadRule(schoolId, dto);
  }

  @Get("cognitive-load-rules")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getLoadRules(@Query("school_id") schoolId: string) {
    return this.learningDNAService.getLoadRules(schoolId);
  }

  @Patch("cognitive-load-rules/:id")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  updateLoadRule(
    @Query("school_id") schoolId: string,
    @Param("id") id: string,
    @Body() dto: any,
  ) {
    return this.learningDNAService.updateLoadRule(schoolId, id, dto);
  }
}
