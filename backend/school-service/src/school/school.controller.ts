import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SchoolService } from './school.service';

@Controller()
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @MessagePattern({ cmd: 'create_lesson_plan' })
  async handleLessonPlanRequest(@Payload() data: { topic: string }) {
    return this.schoolService.getAiLessonPlan(data.topic);
  }
}
