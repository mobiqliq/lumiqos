import { Repository } from 'typeorm';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';
export declare class ResourceAuditorService {
    private readonly teacherSubjectRepo;
    private readonly userRepo;
    constructor(teacherSubjectRepo: Repository<TeacherSubject>, userRepo: Repository<User>);
    auditTeacherWorkload(schoolId: string): Promise<{
        audit_timestamp: string;
        status: string;
        alerts: {
            teacher_id: string;
            teacher_name: string;
            weekly_periods: number;
            limit: number;
            risk_level: string;
            message: string;
            affected_sections: string[];
        }[];
    }>;
}
