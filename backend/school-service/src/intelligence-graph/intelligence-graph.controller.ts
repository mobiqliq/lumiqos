import { Controller, Post, Get, Param } from '@nestjs/common';
import { IntelligenceGraphService } from './intelligence-graph.service';
import { AIClientService } from './ai-client.service';
import { TenantContext } from '@lumiqos/shared';

@Controller('intelligence-graph')
export class IntelligenceGraphController {
  constructor(
    private readonly graphService: IntelligenceGraphService,
    private readonly aiClient: AIClientService,
  ) {}

  @Post('populate')
  async populateGraph() {
    const { schoolId } = TenantContext.getStore();
    return this.graphService.populateGraphFromAcademicData(schoolId);
  }

  @Post('student/:studentId/calculate-mastery')
  async calculateMastery(@Param('studentId') studentId: string) {
    const { schoolId } = TenantContext.getStore();
    return this.graphService.calculateStudentSkillMastery(studentId, schoolId);
  }

  @Get('student/:studentId')
  async getStudentGraph(@Param('studentId') studentId: string) {
    return this.graphService.getStudentGraphData(studentId);
  }

  @Get('student/:studentId/recommendations')
  async getRecommendations(@Param('studentId') studentId: string) {
    return this.aiClient.getRecommendations(studentId);
  }

  @Get('student/:studentId/learning-path')
  async getLearningPath(@Param('studentId') studentId: string) {
    return this.aiClient.getLearningPath(studentId);
  }

  @Get('student/:studentId/interventions')
  async getInterventions(@Param('studentId') studentId: string) {
    return this.aiClient.getInterventionStrategies(studentId);
  }
}
