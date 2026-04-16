import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { ILessonPlan } from '@lumiqos/shared';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post('lesson-plan')
  async generateLessonPlan(@Body('topic') topic: string): Promise<ILessonPlan> {
    return this.teacherService.getLessonPlan(topic);
  }
}
