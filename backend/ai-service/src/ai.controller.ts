import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AiService } from './ai.service';

@Controller()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @MessagePattern({ cmd: 'create_lesson_plan' })
  async handleCreateLessonPlan(@Payload() data: { topic: string }) {
    return this.aiService.createLessonPlan(data.topic);
  }
}
