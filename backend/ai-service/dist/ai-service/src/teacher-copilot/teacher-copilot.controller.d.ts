import { TeacherCopilotService } from './teacher-copilot.service';
export declare class TeacherCopilotController {
    private readonly copilotService;
    constructor(copilotService: TeacherCopilotService);
    generateLessonPlan(req: any, body: any): Promise<void>;
    getClassInsights(req: any): Promise<any>;
    generateHomework(req: any, body: any): Promise<any>;
    generateDifferentiatedHomework(req: any, body: any): Promise<any>;
    generateReportComment(req: any, body: any): Promise<any>;
    getPTMSummary(req: any, studentId: string): Promise<any>;
}
