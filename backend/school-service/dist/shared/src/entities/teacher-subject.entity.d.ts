import { Class } from './class.entity';
import { Section } from './section.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';
export declare class TeacherSubject {
    id: string;
    school_id: string;
    teacher_id: string;
    teacher: User;
    subject_id: string;
    class_id: string;
    section_id: string;
    periods_per_day: number;
    class: Class;
    section: Section;
    subject: Subject;
    created_at: Date;
    updated_at: Date;
}
