import { Repository } from 'typeorm';
import { StudentLearningProfile, StudentGuardian, StudentAttendance, HomeworkSubmission, FeeInvoice, AcademicYear } from '@lumiqos/shared/index';
export declare class ParentEngagementService {
    private guardianRepo;
    private profileRepo;
    private attRepo;
    private hwRepo;
    private invoiceRepo;
    private yrRepo;
    constructor(guardianRepo: Repository<StudentGuardian>, profileRepo: Repository<StudentLearningProfile>, attRepo: Repository<StudentAttendance>, hwRepo: Repository<HomeworkSubmission>, invoiceRepo: Repository<FeeInvoice>, yrRepo: Repository<AcademicYear>);
    validateGuardian(userId: string, schoolId: string, studentId: string): Promise<void>;
    private getActiveYear;
    generateDailyDigest(userId: string, schoolId: string, studentId: string): Promise<any>;
    getLearningTimeline(userId: string, schoolId: string, studentId: string): Promise<any>;
    getFeeInsight(userId: string, schoolId: string, studentId: string): Promise<any>;
    getPtmPrep(userId: string, schoolId: string, studentId: string): Promise<any>;
    getLearningRecommendations(userId: string, schoolId: string, studentId: string): Promise<any>;
    triggerWeeklyReport(): Promise<{
        status: string;
        attendance_change: string;
        homework_completion_change: string;
        engagement_trend: string;
        ai_summary: string;
    }>;
}
