import { School } from './school.entity';
import { AcademicYear } from './academic-year.entity';
export declare enum DayType {
    TEACHING_DAY = "Teaching_Day",
    HOLIDAY = "Holiday",
    ACTIVITY_DAY = "Activity_Day",
    EXAM_DAY = "Exam_Day",
    PRE_EXAM = "Pre_Exam",
    POST_EVENT = "Post_Event",
    BUFFER_DAY = "Buffer_Day",
    BAGLESS_DAY = "Bagless_Day"
}
export declare class SchoolCalendar {
    id: string;
    school_id: string;
    academic_year_id: string;
    date: string;
    day_type: DayType;
    is_working_day: boolean;
    description: string;
    school: School;
    academicYear: AcademicYear;
    created_at: Date;
    updated_at: Date;
}
