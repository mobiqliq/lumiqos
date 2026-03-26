import { Exam } from './exam.entity';
export declare class ExamSubject {
    id: string;
    exam_subject_id: string;
    exam_id: string;
    subject_id: string;
    school_id: string;
    class_id: string;
    section_id: string;
    max_marks: number;
    ai_questions: any;
    bloom_taxonomy: any;
    exam: Exam;
    created_at: Date;
    updated_at: Date;
}
