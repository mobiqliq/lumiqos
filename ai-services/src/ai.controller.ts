import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ILessonPlan } from '@lumiqos/shared';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-lesson-plan')
  async generateLessonPlan(@Body('topic') topic: string): Promise<ILessonPlan> {
    return this.aiService.createLessonPlan(topic);
  }
}
