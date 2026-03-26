import { StudentProfileService } from './student-profile.service';
export declare class StudentProfileController {
    private readonly profileService;
    constructor(profileService: StudentProfileService);
    triggerBatchRebuild(req: any): Promise<{
        status: string;
        profiles_processed: number;
    }>;
    getTeacherProfile(req: any, studentId: string): Promise<{
        error: string;
        learning_velocity?: undefined;
        engagement_score?: undefined;
        consistency_score?: undefined;
        subject_strengths?: undefined;
        subject_weaknesses?: undefined;
        risk_index?: undefined;
        risk_signals?: undefined;
        growth_trend?: undefined;
        profile_last_updated?: undefined;
    } | {
        learning_velocity: number;
        engagement_score: number;
        consistency_score: number;
        subject_strengths: any;
        subject_weaknesses: any;
        risk_index: any;
        risk_signals: any;
        growth_trend: any;
        profile_last_updated: any;
        error?: undefined;
    }>;
    getParentInsights(req: any, studentId: string): Promise<{
        error: string;
        growth_trend?: undefined;
        strengths?: undefined;
        improvement_areas?: undefined;
        engagement_score?: undefined;
        last_updated?: undefined;
    } | {
        growth_trend: any;
        strengths: any;
        improvement_areas: any;
        engagement_score: number;
        last_updated: any;
        error?: undefined;
    }>;
}
