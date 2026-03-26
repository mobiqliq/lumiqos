import { ParentEngagementService } from './parent-engagement.service';
export declare class ParentEngagementController {
    private readonly engagementService;
    constructor(engagementService: ParentEngagementService);
    getDailyDigest(req: any, studentId: string): Promise<any>;
    getLearningTimeline(req: any, studentId: string): Promise<any>;
    getFeeInsight(req: any, studentId: string): Promise<any>;
    getPtmPrep(req: any, studentId: string): Promise<any>;
    getLearningRecommendations(req: any, studentId: string): Promise<any>;
    triggerWeeklyReport(): Promise<{
        status: string;
        attendance_change: string;
        homework_completion_change: string;
        engagement_trend: string;
        ai_summary: string;
    }>;
}
