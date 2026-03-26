import { School } from './school.entity';
import { AcademicYear } from './academic-year.entity';
export declare class AcademicCalendarEvent {
    id: string;
    school_id: string;
    academic_year_id: string;
    month_name: string;
    working_days: number;
    events: string[];
    status: string;
    school: School;
    academic_year: AcademicYear;
    created_at: Date;
    updated_at: Date;
}
