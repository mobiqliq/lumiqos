import { Repository } from 'typeorm';
import { LessonPlan } from '@lumiqos/shared/src/entities/lesson-plan.entity';
import { PlannedSchedule } from '@lumiqos/shared/src/entities/planned-schedule.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { SchoolCalendar } from '@lumiqos/shared/src/entities/school-calendar.entity';
export declare class ComplianceAuditorService {
    private readonly lessonRepo;
    private readonly scheduleRepo;
    private readonly subjectRepo;
    private readonly calendarRepo;
    constructor(lessonRepo: Repository<LessonPlan>, scheduleRepo: Repository<PlannedSchedule>, subjectRepo: Repository<Subject>, calendarRepo: Repository<SchoolCalendar>);
    getComplianceAudit(schoolId: string, yearId: string): Promise<{
        ail_compliance: string;
        vocational_ratio: string;
        bagless_days_scheduled: string;
        status: {
            ail_risk: boolean;
            vocational_risk: boolean;
            bagless_pause_compliance: boolean;
        };
    }>;
    generateNEPReport(schoolId: string, yearId: string): Promise<{
        school_id: string;
        academic_year: string;
        report_type: string;
        generated_at: string;
        summary: {
            art_integration: {
                status: string;
                value: string;
                target: string;
                evidence: string;
            };
            bagless_days: {
                status: string;
                value: string;
                target: string;
                evidence: string;
            };
            vocational_ratio: {
                status: string;
                value: string;
                target: string;
                evidence: string;
            };
        };
        certification: {
            statement: string;
            inspector_ready: boolean;
            verification_id: string;
        };
    }>;
}
