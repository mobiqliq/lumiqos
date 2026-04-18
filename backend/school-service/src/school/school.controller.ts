import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SchoolService } from './school.service';

@Controller()
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @MessagePattern({ cmd: 'create_lesson_plan' })
  async handleLessonPlanRequest(@Payload() data: any) {
    // If it is just a topic string, use AI; otherwise, save the provided data
    if (typeof data === 'string' || (data.topic && Object.keys(data).length === 1)) {
      const topic = typeof data === 'string' ? data : data.topic;
      return this.schoolService.getAiLessonPlan(topic);
    }
    
    return this.schoolService.saveLessonPlan(data);
  }
}
