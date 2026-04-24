import { Controller, Get, Post, Patch, Param, Body, Headers, Query } from '@nestjs/common';
import { TeacherWellbeingService } from './teacher-wellbeing.service';

@Controller('teacher-wellbeing')
export class TeacherWellbeingController {
  constructor(private readonly service: TeacherWellbeingService) {}

  @Get('rules')
  getRules() {
    return this.service.getRules();
  }

  @Post('rules')
  upsertRules(@Body() dto: any, @Headers('x-user-id') userId: string) {
    return this.service.upsertRules(dto, userId);
  }

  @Post('workload/compute')
  compute(
    @Body('academic_year_id') academicYearId: string,
    @Body('week_date') weekDate: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.computeWorkload(academicYearId, weekDate);
  }

  @Get('workload')
  getHeatmap(
    @Query('academic_year_id') academicYearId: string,
    @Query('week_date') weekDate?: string,
  ) {
    return this.service.getHeatmap(academicYearId, weekDate);
  }

  @Get('workload/:staffId')
  getStaffWorkload(@Param('staffId') staffId: string) {
    return this.service.getStaffWorkload(staffId);
  }

  @Post('check-assignment')
  checkAssignment(@Body() dto: any) {
    return this.service.checkAssignment(dto);
  }

  @Post('referral')
  submitReferral(
    @Body() dto: { notes: string; contact_preference?: string },
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.submitReferral(dto, userId);
  }

  @Patch('workload/:id/acknowledge')
  acknowledge(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.acknowledgeWorkload(id, userId);
  }
}
