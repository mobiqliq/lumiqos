import { Repository } from 'typeorm';
import { LessonPlan } from '@lumiqos/shared/src/entities/lesson-plan.entity';
import { SchoolCalendar } from '@lumiqos/shared/src/entities/school-calendar.entity';
import { PlannedSchedule } from '@lumiqos/shared/src/entities/planned-schedule.entity';
import { CurriculumUnit } from '@lumiqos/shared/src/entities/curriculum-unit.entity';
import { Section } from '@lumiqos/shared/src/entities/section.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
export declare class PedagogicalPourService {
    private lessonPlanRepo;
    private calendarRepo;
    private scheduleRepo;
    private unitRepo;
    private sectionRepo;
    private teacherSubjectRepo;
    private readonly logger;
    constructor(lessonPlanRepo: Repository<LessonPlan>, calendarRepo: Repository<SchoolCalendar>, scheduleRepo: Repository<PlannedSchedule>, unitRepo: Repository<CurriculumUnit>, sectionRepo: Repository<Section>, teacherSubjectRepo: Repository<TeacherSubject>);
    generateBaselineSchedule(schoolId: string, yearId: string, classId: string, sectionId: string | undefined, subjectId: string): Promise<{
        error: string;
        message?: undefined;
        lessons_scheduled?: undefined;
        total_slots_used?: undefined;
        example_first_date?: undefined;
    } | {
        message: string;
        lessons_scheduled: number;
        total_slots_used: number;
        example_first_date: string | undefined;
        error?: undefined;
    }>;
    private getWeekNumber;
}
