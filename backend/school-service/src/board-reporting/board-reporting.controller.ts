import { Controller, Get, Post, Patch, Body, Param, Req, Query, UseGuards } from "@nestjs/common";
import { BoardReportingService } from "./board-reporting.service";
import { JwtAuthGuard } from "@xceliqos/shared";
import { BoardReportType, BoardReportStatus, BoardReportVisibility } from "@xceliqos/shared/src/entities/board-report.entity";

@Controller("board-reports")
@UseGuards(JwtAuthGuard)
export class BoardReportingController {
  constructor(private readonly service: BoardReportingService) {}

  @Post()
  generate(@Req() req: any, @Body() dto: {
    title: string;
    report_type: BoardReportType;
    period_start: Date;
    period_end: Date;
    academic_year_id?: string;
    visibility?: BoardReportVisibility;
    data_snapshot?: Record<string, any>;
    ai_narrative?: string;
  }) {
    return this.service.generate(req.user.school_id, dto, req.user.user_id);
  }

  @Get()
  list(
    @Req() req: any,
    @Query("report_type") report_type?: BoardReportType,
    @Query("status") status?: BoardReportStatus,
    @Query("academic_year_id") academic_year_id?: string,
  ) {
    return this.service.list(req.user.school_id, { report_type, status, academic_year_id });
  }

  @Get(":id")
  getOne(@Req() req: any, @Param("id") id: string) {
    return this.service.getOne(req.user.school_id, id);
  }

  @Patch(":id")
  update(@Req() req: any, @Param("id") id: string, @Body() dto: any) {
    return this.service.update(req.user.school_id, id, dto, req.user.user_id);
  }

  @Patch(":id/publish")
  publish(@Req() req: any, @Param("id") id: string) {
    return this.service.publish(req.user.school_id, id, req.user.user_id);
  }

  @Patch(":id/archive")
  archive(@Req() req: any, @Param("id") id: string) {
    return this.service.archive(req.user.school_id, id, req.user.user_id);
  }

  @Post(":id/approve")
  approve(@Req() req: any, @Param("id") id: string) {
    return this.service.approve(req.user.school_id, id, req.user.user_id);
  }
}
