import { Repository } from 'typeorm';
import { SchoolCalendar } from '@lumiqos/shared/src/entities/school-calendar.entity';
import { TimeSlot } from '@lumiqos/shared/src/entities/time-slot.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { PlannedSchedule } from '@lumiqos/shared/src/entities/planned-schedule.entity';
export declare class AcademicCalendarService {
    private calendarRepo;
    private slotRepo;
    private yearRepo;
    private teacherSubjectRepo;
    private classRepo;
    private subjectRepo;
    private scheduleRepo;
    constructor(calendarRepo: Repository<SchoolCalendar>, slotRepo: Repository<TimeSlot>, yearRepo: Repository<AcademicYear>, teacherSubjectRepo: Repository<TeacherSubject>, classRepo: Repository<Class>, subjectRepo: Repository<Subject>, scheduleRepo: Repository<PlannedSchedule>);
    generateYearCalendar(schoolId: string, yearId: string): Promise<SchoolCalendar[]>;
    calculateTeachingCapacity(schoolId: string, yearId: string): Promise<number>;
    validateCurriculumFit(availableMinutes: number, syllabusMinutes: number): Promise<{
        valid: boolean;
        warning: string;
        deficit: number;
    } | {
        valid: boolean;
        warning: null;
        deficit: number;
    }>;
    calculateSubjectAvailability(schoolId: string, yearId: string, classId: string, sectionId: string, subjectId: string): Promise<{
        class: string | undefined;
        subject: string | undefined;
        total_available_periods: number;
        formatted: string;
    }>;
    processEmergencyClosure(schoolId: string, date: string): Promise<{
        date: string;
        affected_lessons: number;
        recovery_plans: {
            id: string;
            name: string;
            description: string;
            action: string;
        }[];
    }>;
    initCalendarBoundaries(schoolId: string, yearId: string, startDate: string, endDate: string, holidays: Array<{
        date: string;
        description: string;
    }>): Promise<SchoolCalendar[]>;
    getAcademicGaps(schoolId: string, yearId: string): Promise<{
        subject_id: any;
        subject_name: string | undefined;
        last_date: any;
        buffer_days: number;
        risk: string;
        message: string;
    }[]>;
    rippleScheduleChange(scheduleId: string, newDate: string): Promise<{
        shifted: number;
    } | undefined>;
}
