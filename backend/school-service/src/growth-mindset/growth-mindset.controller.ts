import { Controller, Get, Post, Patch, Body, Param, Req, Query, UseGuards } from "@nestjs/common";
import { GrowthMindsetService } from "./growth-mindset.service";
import { JwtAuthGuard } from "@xceliqos/shared";
import { MindsetMomentType } from "@xceliqos/shared/src/entities/mindset-moment.entity";

@Controller("mindset")
@UseGuards(JwtAuthGuard)
export class GrowthMindsetController {
  constructor(private readonly service: GrowthMindsetService) {}

  // ── Moments ──────────────────────────────────────────────────────────────

  @Post("moments")
  createMoment(@Req() req: any, @Body() dto: any) {
    return this.service.createMoment(req.user.school_id, dto, req.user.user_id);
  }

  @Get("moments/:student_id")
  listMoments(
    @Req() req: any,
    @Param("student_id") student_id: string,
    @Query("moment_type") moment_type?: MindsetMomentType,
    @Query("shared_with_parent") shared_with_parent?: string,
  ) {
    const sharedFilter = shared_with_parent !== undefined ? shared_with_parent === "true" : undefined;
    return this.service.listMoments(req.user.school_id, student_id, { moment_type, shared_with_parent: sharedFilter });
  }

  @Patch("moments/:id")
  updateMoment(@Req() req: any, @Param("id") id: string, @Body() dto: any) {
    return this.service.updateMoment(req.user.school_id, id, dto, req.user.user_id);
  }

  @Post("moments/:id/share-with-parent")
  shareWithParent(@Req() req: any, @Param("id") id: string) {
    return this.service.shareWithParent(req.user.school_id, id, req.user.user_id);
  }

  // ── Parent Progress ──────────────────────────────────────────────────────

  @Get("parent-progress/:student_id")
  getParentProgress(
    @Req() req: any,
    @Param("student_id") student_id: string,
    @Query("academic_year_id") academic_year_id?: string,
  ) {
    return this.service.getParentProgress(req.user.school_id, student_id, academic_year_id);
  }

  @Post("parent-progress")
  upsertParentProgress(@Req() req: any, @Body() dto: any) {
    return this.service.upsertParentProgress(req.user.school_id, dto, req.user.user_id);
  }
}
