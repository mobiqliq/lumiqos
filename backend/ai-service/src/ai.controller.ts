import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AiService } from './ai.service';
import { StudentGraphData } from './interfaces/recommendation.interface';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('lesson-plan')
  async createLessonPlan(@Body('topic') topic: string) {
    return this.aiService.createLessonPlan(topic);
  }

  @Post('recommendations')
  async generateRecommendations(@Body() graphData: StudentGraphData) {
    return this.aiService.generateRecommendations(graphData);
  }

  @Post('learning-path')
  async generateLearningPath(@Body() graphData: StudentGraphData) {
    return this.aiService.generateLearningPath(graphData);
  }

  @Post('intervention-strategies')
  async generateInterventionStrategies(@Body() graphData: StudentGraphData) {
    return this.aiService.generateInterventionStrategies(graphData);
  }

  @Get('health')
  async healthCheck() {
    return { status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() };
  }
}
