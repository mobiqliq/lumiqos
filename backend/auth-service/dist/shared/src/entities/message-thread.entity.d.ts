import { Student } from './student.entity';
export declare class MessageThread {
    id: string;
    thread_id: string;
    school_id: string;
    teacher_id: string;
    student_id: string;
    created_by: string;
    student: Student;
    created_at: Date;
    updated_at: Date;
}
