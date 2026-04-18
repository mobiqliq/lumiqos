import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ResilientHttpClient, getAIServiceUrl } from '@lumiqos/shared';
import { IntelligenceGraphService } from './intelligence-graph.service';

@Injectable()
export class AIClientService {
  private readonly logger = new Logger(AIClientService.name);
  private readonly resilientClient: ResilientHttpClient;
  private readonly aiServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly graphService: IntelligenceGraphService,
  ) {
    this.resilientClient = new ResilientHttpClient();
    this.aiServiceUrl = getAIServiceUrl();
  }

  async getRecommendations(studentId: string): Promise<any> {
    const graphData = await this.graphService.getStudentGraphData(studentId);
    
    return this.resilientClient.request(
      'ai-service',
      async () => {
        const response = await this.httpService.axiosRef.post(
          `${this.aiServiceUrl}/ai/recommendations`,
          graphData
        );
        return response.data;
      },
      () => this.getFallbackRecommendations(graphData)
    );
  }

  async getLearningPath(studentId: string): Promise<any> {
    const graphData = await this.graphService.getStudentGraphData(studentId);
    
    return this.resilientClient.request(
      'ai-service',
      async () => {
        const response = await this.httpService.axiosRef.post(
          `${this.aiServiceUrl}/ai/learning-path`,
          graphData
        );
        return response.data;
      },
      () => this.getFallbackLearningPath(graphData)
    );
  }

  async getInterventionStrategies(studentId: string): Promise<any> {
    const graphData = await this.graphService.getStudentGraphData(studentId);
    
    return this.resilientClient.request(
      'ai-service',
      async () => {
        const response = await this.httpService.axiosRef.post(
          `${this.aiServiceUrl}/ai/intervention-strategies`,
          graphData
        );
        return response.data;
      },
      () => ({
        immediate: ['Schedule teacher consultation'],
        shortTerm: ['Daily practice sessions'],
        longTerm: ['Monthly progress review']
      })
    );
  }

  private getFallbackRecommendations(graphData: any): any {
    const weakSkills = graphData.skills?.filter((s: any) => s.mastery < 50) || [];
    return {
      recommendations: weakSkills.slice(0, 3).map((s: any) => ({
        type: 'intervention',
        priority: 'medium',
        skillName: s.name,
        title: 'Improve ' + s.name,
        description: 'Practice ' + s.name + ' regularly',
        suggestedResources: ['Online exercises', 'Worksheets'],
        estimatedTimeMinutes: 30,
        expectedImprovement: 10
      })),
      analysis: 'Focus on strengthening weak areas through consistent practice.'
    };
  }

  private getFallbackLearningPath(graphData: any): any {
    return {
      studentId: graphData.studentId,
      generatedAt: new Date().toISOString(),
      overallMastery: graphData.summary?.averageMastery || 0,
      focusAreas: [],
      recommendations: [],
      weeklyPlan: [
        { day: 1, focus: 'Core Skills', activities: ['Practice exercises'], duration: 30 },
        { day: 2, focus: 'Review', activities: ['Self-assessment'], duration: 20 }
      ],
      longTermGoals: ['Improve overall mastery by 10 percent']
    };
  }
}
