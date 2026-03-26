import { Class } from './class.entity';
import { Section } from './section.entity';
export declare class StudentEnrollment {
    id: string;
    admission_number: string;
    enrollment_id: string;
    student_id: string;
    school_id: string;
    academic_year_id: string;
    class_id: string;
    section_id: string;
    roll_number: string;
    status: string;
    class: Class;
    section: Section;
    created_at: Date;
    updated_at: Date;
}
