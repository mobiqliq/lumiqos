import { Controller, Get, Post, Param, Body, Headers, Query } from '@nestjs/common';
import { XceliQReviseService } from './xceliq-revise.service';

@Controller('xceliq-revise')
export class XceliQReviseController {
  constructor(private readonly service: XceliQReviseService) {}

  @Post('schedule/:studentId')
  schedule(
    @Param('studentId') studentId: string,
    @Body('academic_year_id') academicYearId: string,
    @Body('class_id') classId: string,
  ) {
    return this.service.scheduleForStudent(studentId, academicYearId, classId);
  }

  @Get('tasks/:studentId')
  getDueTasks(@Param('studentId') studentId: string) {
    return this.service.getDueTasks(studentId);
  }

  @Post('tasks/:taskId/respond')
  submitResponse(
    @Param('taskId') taskId: string,
    @Body() dto: {
      student_response: string;
      is_correct: boolean;
      quality_score: number;
      response_time_ms?: number;
    },
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.submitResponse(taskId, dto, userId);
  }

  @Get('curve/:studentId')
  getCurveState(@Param('studentId') studentId: string) {
    return this.service.getCurveState(studentId);
  }

  @Get('analytics/:studentId')
  getAnalytics(@Param('studentId') studentId: string) {
    return this.service.getAnalytics(studentId);
  }
}
