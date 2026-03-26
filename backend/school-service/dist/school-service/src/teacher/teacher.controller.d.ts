import { TeacherService } from './teacher.service';
export declare class TeacherController {
    private readonly teacherService;
    constructor(teacherService: TeacherService);
    getDashboard(req: any): Promise<{
        today_schedule: {
            class_name: string;
            section_name: string;
            subject_name: string;
        }[];
        pending_homework_reviews: number;
        pending_grading: number;
        unread_parent_messages: number;
    }>;
    getClasses(req: any): Promise<{
        class_id: string;
        section_id: string;
        subject_id: string;
        class_name: string;
        section_name: string;
        subject_name: string;
    }[]>;
    quickAttendance(req: any, body: any): Promise<{
        message: string;
        total_students_processed: number;
    }>;
    quickHomework(req: any, body: any): Promise<{
        message: string;
        homework_id: string;
    }>;
    getHomeworkSubmissions(req: any, limit?: number, offset?: number): Promise<import("@lumiqos/shared/index").HomeworkSubmission[]>;
    quickGrade(req: any, body: any): Promise<{
        message: string;
    }>;
    getMessages(req: any): Promise<{
        thread_id: string;
        student_name: string;
        latest_message: any;
        last_updated: any;
    }[]>;
    getTeachersList(data: {
        schoolId: string;
    }): Promise<import("@lumiqos/shared/index").User[]>;
    getTeacherDashboard(data: {
        schoolId: string;
        userId: string;
    }): Promise<{
        today_schedule: {
            class_name: string;
            section_name: string;
            subject_name: string;
        }[];
        pending_homework_reviews: number;
        pending_grading: number;
        unread_parent_messages: number;
    }>;
}
