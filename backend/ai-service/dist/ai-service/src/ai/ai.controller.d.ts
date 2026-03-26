import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    getStudentPerformance(req: any, studentId: string): Promise<{
        analysis: any;
        confidence_score: number;
        generated_at: string;
        generated_by: string;
    }>;
    getClassAnalytics(req: any): Promise<{
        analysis: any;
        confidence_score: number;
        generated_at: string;
        generated_by: string;
    }>;
    getRiskStudents(req: any): Promise<{
        analysis: any;
        confidence_score: number;
        generated_at: string;
        generated_by: string;
    }>;
    generateCurriculum(req: any, body: any): Promise<{
        analysis: any;
        confidence_score: number;
        generated_at: string;
        generated_by: string;
    }>;
    generateAssessment(req: any, body: any): Promise<{
        analysis: any;
        confidence_score: number;
        generated_at: string;
        generated_by: string;
    }>;
    evaluateHomework(req: any, body: any): Promise<{
        analysis: any;
        confidence_score: number;
        generated_at: string;
        generated_by: string;
    }>;
}
