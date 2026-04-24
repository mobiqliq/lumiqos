import { Controller, Get, Post, Patch, Param, Body, Headers, Query } from '@nestjs/common';
import { StudentWellbeingService } from './student-wellbeing.service';
import { WellbeingTier, WellbeingFlagStatus } from '@xceliqos/shared/src/entities/wellbeing-flag.entity';

@Controller('student-wellbeing')
export class StudentWellbeingController {
  constructor(private readonly service: StudentWellbeingService) {}

  @Post('scan/:studentId')
  scan(
    @Param('studentId') studentId: string,
    @Body('academic_year_id') academicYearId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.scanStudent(studentId, academicYearId, userId);
  }

  @Post('scan/class/:classId')
  scanClass(
    @Param('classId') classId: string,
    @Body('academic_year_id') academicYearId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.scanClass(classId, academicYearId, userId);
  }

  @Get('flags')
  getFlags(
    @Query('tier') tier?: WellbeingTier,
    @Query('status') status?: WellbeingFlagStatus,
    @Query('academic_year_id') academic_year_id?: string,
  ) {
    return this.service.getFlags({ tier, status, academic_year_id });
  }

  @Get('flags/:studentId')
  getStudentFlags(@Param('studentId') studentId: string) {
    return this.service.getStudentFlags(studentId);
  }

  @Patch('flags/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: { status: WellbeingFlagStatus; care_note?: string },
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.updateFlagStatus(id, dto, userId);
  }

  @Get('guides/:signal_type')
  getGuide(@Param('signal_type') signalType: string) {
    return this.service.getGuide(signalType);
  }
}
