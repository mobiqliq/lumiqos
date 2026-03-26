import { Repository } from 'typeorm';
import { PlannedSchedule } from '@lumiqos/shared/src/entities/planned-schedule.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
export declare class SubstitutionService {
    private readonly scheduleRepo;
    private readonly userRepo;
    private readonly teacherSubjectRepo;
    constructor(scheduleRepo: Repository<PlannedSchedule>, userRepo: Repository<User>, teacherSubjectRepo: Repository<TeacherSubject>);
    findSubstitute(absentTeacherId: string, date: string, slotId: string): Promise<{
        message: string;
        alert?: undefined;
        recommendation?: undefined;
        substitution_type?: undefined;
        teacher_id?: undefined;
    } | {
        alert: string;
        recommendation: string;
        substitution_type: string;
        message?: undefined;
        teacher_id?: undefined;
    } | {
        alert: string;
        recommendation: string;
        substitution_type: string;
        teacher_id: string;
        message?: undefined;
    }>;
    executeHandover(outgoingTeacherId: string, incomingTeacherId: string, effectiveDate: string): Promise<{
        message: string;
        count: number;
        handover_report: {
            section_id: string;
            class_name: string;
            subject_name: string;
            last_completed_lesson: string;
            completion_date: string;
            velocity_score: number;
        }[];
    }>;
}
