import { HomeworkAssignment } from './homework-assignment.entity';
export declare class HomeworkSubmission {
    id: string;
    submission_id: string;
    homework_id: string;
    student_id: string;
    school_id: string;
    submission_text: string;
    submission_file_url: string;
    teacher_remark: string;
    teacher_feedback: string;
    submission_data: any;
    grade: string;
    graded_at: Date;
    submitted_at: Date;
    status: string;
    homework: HomeworkAssignment;
    created_at: Date;
    updated_at: Date;
}
