import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('teacher')
export class TeacherController {
  constructor(@Inject('SCHOOL_SERVICE') private schoolClient: ClientProxy) {}

  @Post('lesson-plan')
  createLessonPlan(@Body() data: any) {
    // This forwards the HTTP body to the School Service over TCP
    return this.schoolClient.send({ cmd: 'create_lesson_plan' }, data);
  }
}
