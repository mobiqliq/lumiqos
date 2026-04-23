import { Controller, Get, Post, Param, Body, Headers, Query } from '@nestjs/common';
import { HomeworkTransparencyService } from './homework-transparency.service';

@Controller('homework-transparency')
export class HomeworkTransparencyController {
  constructor(private readonly service: HomeworkTransparencyService) {}

  @Get('student/:studentId')
  getStudentView(@Param('studentId') studentId: string) {
    return this.service.getStudentView(studentId);
  }

  @Get('parent/:studentId')
  getParentView(@Param('studentId') studentId: string) {
    return this.service.getParentView(studentId);
  }

  @Get('teacher/queue')
  getTeacherQueue(@Headers('x-user-id') teacherId: string) {
    return this.service.getTeacherQueue(teacherId);
  }

  @Post('submissions/:id/feedback')
  submitFeedback(
    @Param('id') submissionId: string,
    @Body() dto: {
      strength: string;
      improvement: string;
      encouragement: string;
      grade?: string;
      parent_visible?: boolean;
      ai_draft?: Record<string, any>;
    },
    @Headers('x-user-id') teacherId: string,
  ) {
    return this.service.submitFeedback(submissionId, dto, teacherId);
  }

  @Post('submissions/:id/notify-parent')
  notifyParent(
    @Param('id') submissionId: string,
    @Body('student_id') studentId: string,
  ) {
    return this.service.notifyParent(submissionId, studentId);
  }

  @Get('analytics/class')
  getClassAnalytics(@Query('class_id') classId: string) {
    return this.service.getClassAnalytics(classId);
  }
}
