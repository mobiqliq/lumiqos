import { Repository } from 'typeorm';
import { PlannedSchedule } from '@lumiqos/shared/src/entities/planned-schedule.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';
import { AcademicService } from './academic.service';
export declare class TeacherHealthService {
    private readonly scheduleRepo;
    private readonly teacherSubjectRepo;
    private readonly userRepo;
    private readonly academicService;
    constructor(scheduleRepo: Repository<PlannedSchedule>, teacherSubjectRepo: Repository<TeacherSubject>, userRepo: Repository<User>, academicService: AcademicService);
    getSupportRadar(schoolId: string): Promise<{
        teacher_id: string;
        teacher_name: string;
        velocity: number;
        density_score: string;
        diagnosis: string;
        rationale: string;
        recommendation: string;
        action_label: string;
    }[]>;
}
