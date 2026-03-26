import { School } from './school.entity';
import { AcademicYear } from './academic-year.entity';
import { LessonPlan } from './lesson-plan.entity';
import { SchoolCalendar } from './school-calendar.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';
import { TimeSlot } from './time-slot.entity';
export declare enum ScheduleStatus {
    SCHEDULED = "Scheduled",
    COMPLETED = "Completed",
    DELAYED = "Delayed",
    SKIPPED = "Skipped"
}
export declare class PlannedSchedule {
    id: string;
    school_id: string;
    academic_year_id: string;
    section_id: string;
    lesson_id: string;
    calendar_id: string;
    class_id: string;
    subject_id: string;
    planned_date: string;
    actual_completion_date: string;
    deviation_days: number;
    title_override: string;
    teacher_id: string;
    slot_id: string;
    status: ScheduleStatus;
    school: School;
    academicYear: AcademicYear;
    lesson: LessonPlan;
    calendar: SchoolCalendar;
    class: Class;
    subject: Subject;
    teacher: User;
    slot: TimeSlot;
    created_at: Date;
    updated_at: Date;
}
