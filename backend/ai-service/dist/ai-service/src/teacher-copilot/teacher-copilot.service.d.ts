import { Repository } from 'typeorm';
import { StudentLearningProfile, AcademicYear } from '@lumiqos/shared/index';
export declare class TeacherCopilotService {
    private profileRepo;
    private yrRepo;
    private lessonCache;
    private TTL_24H;
    private rateLimits;
    constructor(profileRepo: Repository<StudentLearningProfile>, yrRepo: Repository<AcademicYear>);
    private getActiveYear;
    private checkRateLimit;
    generateLessonPlan(teacherId: string, payload: any): Promise<void>;
}
