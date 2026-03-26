import { Repository } from 'typeorm';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { NCERTSeederService } from '../database/ncert-seeder.service';
import { PedagogicalPourService } from './pedagogical-pour.service';
export declare class OnboardingService {
    private readonly teacherSubjectRepo;
    private readonly ncertSeederService;
    private readonly pedagogicalPourService;
    private readonly logger;
    constructor(teacherSubjectRepo: Repository<TeacherSubject>, ncertSeederService: NCERTSeederService, pedagogicalPourService: PedagogicalPourService);
    launchAcademicYear(schoolId: string, yearId: string, board: string, teacherAssignments: Array<{
        teacher_id: string;
        class_id: string;
        section_id: string;
        subject_id: string;
        periods_per_day: number;
    }>): Promise<{
        status: string;
        message: string;
        stats: {
            teachers_assigned: number;
            topics_seeded: number;
            schedules_generated: number;
            board: string;
            year: string;
        };
    }>;
}
