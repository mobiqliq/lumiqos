import { Controller, Post, Get, Param } from '@nestjs/common';
import { IntelligenceGraphService } from './intelligence-graph.service';
import { TenantContext } from '@lumiqos/shared';

@Controller('intelligence-graph')
export class IntelligenceGraphController {
  constructor(private readonly graphService: IntelligenceGraphService) {}

  /**
   * Populate graph from existing academic data
   */
  @Post('populate')
  async populateGraph() {
    const { schoolId } = TenantContext.getStore();
    return this.graphService.populateGraphFromAcademicData(schoolId);
  }

  /**
   * Calculate skill mastery for a student
   */
  @Post('student/:studentId/calculate-mastery')
  async calculateMastery(@Param('studentId') studentId: string) {
    const { schoolId } = TenantContext.getStore();
    await this.graphService.calculateStudentSkillMastery(studentId, schoolId);
    return { success: true, message: 'Skill mastery calculated' };
  }

  /**
   * Get student intelligence graph data
   */
  @Get('student/:studentId')
  async getStudentGraph(@Param('studentId') studentId: string) {
    return this.graphService.getStudentGraphData(studentId);
  }

  /**
   * Get recommended interventions based on graph analysis
   */
  @Get('student/:studentId/recommendations')
  async getRecommendations(@Param('studentId') studentId: string) {
    const graphData = await this.graphService.getStudentGraphData(studentId);
    
    const recommendations: string[] = [];
    
    for (const skill of graphData.skills) {
      if (skill.mastery < 50) {
        recommendations.push(`Focus on improving ${skill.name} skills`);
      }
    }
    
    return {
      studentId,
      recommendations,
      graphData
    };
  }
}
