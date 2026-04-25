import { Controller, Get, Post, Patch, Body, Param, Req, Query, UseGuards } from "@nestjs/common";
import { XceliQReflectService } from "./xceliq-reflect.service";
import { JwtAuthGuard } from "@xceliqos/shared";
import { ReflectionType, ReflectionVisibility } from "@xceliqos/shared/src/entities/reflection-entry.entity";
import { MetacognitiveDimension } from "@xceliqos/shared/src/entities/metacognitive-score.entity";

@Controller("reflect")
@UseGuards(JwtAuthGuard)
export class XceliQReflectController {
  constructor(private readonly service: XceliQReflectService) {}

  // ── Entries ──────────────────────────────────────────────────────────────

  @Post("entries")
  createEntry(@Req() req: any, @Body() dto: any) {
    return this.service.createEntry(req.user.school_id, dto, req.user.user_id);
  }

  @Get("entries")
  listEntries(
    @Req() req: any,
    @Query("student_id") student_id?: string,
    @Query("academic_year_id") academic_year_id?: string,
    @Query("reflection_type") reflection_type?: ReflectionType,
    @Query("visibility") visibility?: ReflectionVisibility,
  ) {
    return this.service.listEntries(req.user.school_id, { student_id, academic_year_id, reflection_type, visibility });
  }

  @Get("entries/:id")
  getEntry(@Req() req: any, @Param("id") id: string) {
    return this.service.getEntry(req.user.school_id, id);
  }

  @Post("entries/:id/ai-feedback")
  addAiFeedback(@Req() req: any, @Param("id") id: string, @Body("ai_feedback") ai_feedback: string) {
    return this.service.addAiFeedback(req.user.school_id, id, ai_feedback, req.user.user_id);
  }

  // ── Scores ───────────────────────────────────────────────────────────────

  @Post("scores")
  createScore(@Req() req: any, @Body() dto: any) {
    return this.service.createScore(req.user.school_id, dto, req.user.user_id);
  }

  @Get("scores/:student_id")
  getScoresByStudent(
    @Req() req: any,
    @Param("student_id") student_id: string,
    @Query("academic_year_id") academic_year_id?: string,
  ) {
    return this.service.getScoresByStudent(req.user.school_id, student_id, academic_year_id);
  }

  @Patch("scores/:id")
  updateScore(@Req() req: any, @Param("id") id: string, @Body() dto: any) {
    return this.service.updateScore(req.user.school_id, id, dto, req.user.user_id);
  }
}
