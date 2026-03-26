import { Exam } from './exam.entity';
export declare class ReportCard {
    id: string;
    report_card_id: string;
    school_id: string;
    student_id: string;
    exam_id: string;
    exam: Exam;
    class_id: string;
    section_id: string;
    total_marks: number;
    percentage: number;
    rank: number;
    status: string;
    is_signed_by_principal: boolean;
    principal_signed_at: Date;
    created_at: Date;
    updated_at: Date;
}
