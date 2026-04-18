import { Controller, Post, Get, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TenantInterceptor, JwtAuthGuard } from '@lumiqos/shared';

@Controller('teacher')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post('lesson-plan')
  async generateLessonPlan(@Body('topic') topic: string): Promise<any> {
    return this.teacherService.getLessonPlan(topic);
  }

  @Get('lesson-plans')
  async getAllPlans(): Promise<any[]> {
    return this.teacherService.findAllPlans();
  }
}
