import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common";
import { AdmissionsService } from "./admissions.service";
import { JwtAuthGuard } from "@xceliqos/shared";
import { RbacGuard } from "@xceliqos/shared";
import { RequirePermissions } from "@xceliqos/shared";
import { AdmissionStage } from "@xceliqos/shared/src/entities/admission-application.entity";
import { DocumentStatus } from "@xceliqos/shared/src/entities/admission-document.entity";

@Controller("admissions")
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  // Pipeline summary
  @Get("pipeline/summary")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getPipelineSummary(@Query("academic_year_id") academicYearId: string) {
    return this.admissionsService.getPipelineSummary(academicYearId);
  }

  // Applications
  @Post("applications")
  createApplication(@Body() dto: any) { return this.admissionsService.createApplication(dto); }

  @Get("applications")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getApplications(
    @Query("stage") stage?: string,
    @Query("academic_year_id") academic_year_id?: string,
    @Query("class_id") class_id?: string,
  ) { return this.admissionsService.getApplications({ stage, academic_year_id, class_id }); }

  @Get("applications/:id")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getApplication(@Param("id") id: string) { return this.admissionsService.getApplication(id); }

  @Patch("applications/:id/stage")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  advanceStage(@Param("id") id: string, @Body() dto: { stage: AdmissionStage; notes?: string }) {
    return this.admissionsService.advanceStage(id, dto);
  }

  @Post("applications/:id/offer")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  recordOffer(@Param("id") id: string, @Body() dto: any) { return this.admissionsService.recordOffer(id, dto); }

  @Post("applications/:id/offer/respond")
  respondToOffer(@Param("id") id: string, @Body() dto: { accepted: boolean; notes?: string }) {
    return this.admissionsService.respondToOffer(id, dto);
  }

  // Documents
  @Post("applications/:id/documents")
  addDocument(@Param("id") id: string, @Body() dto: any) { return this.admissionsService.addDocument(id, dto); }

  @Patch("documents/:id/verify")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  verifyDocument(@Param("id") id: string, @Body() dto: { status: DocumentStatus; rejection_reason?: string }) {
    return this.admissionsService.verifyDocument(id, dto);
  }

  // Waitlist
  @Post("waitlist")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  addToWaitlist(@Body() dto: any) { return this.admissionsService.addToWaitlist(dto); }

  @Get("waitlist")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getWaitlist(@Query("academic_year_id") academicYearId: string, @Query("class_id") classId?: string) {
    return this.admissionsService.getWaitlist(academicYearId, classId);
  }

  @Patch("waitlist/:id/respond")
  respondToWaitlistOffer(@Param("id") id: string, @Body() dto: { accepted: boolean }) {
    return this.admissionsService.respondToWaitlistOffer(id, dto);
  }

  // Reservation config
  @Post("reservations")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  upsertReservationConfig(@Body() dto: any) { return this.admissionsService.upsertReservationConfig(dto); }

  @Get("reservations")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getReservationConfigs(@Query("academic_year_id") academicYearId: string) {
    return this.admissionsService.getReservationConfigs(academicYearId);
  }
}
