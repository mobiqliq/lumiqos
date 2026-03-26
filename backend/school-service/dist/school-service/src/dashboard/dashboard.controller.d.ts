import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getOverview(): Promise<{
        students: {
            total_students: number;
            active_students: number;
            new_admissions_this_year: number;
        };
        attendance: {
            today_attendance_rate: number;
            absent_students_today: number;
            average_attendance_this_month: number;
        };
        academics: {
            exams_completed: number;
            average_exam_score: number;
            pending_signatures: number;
            at_risk_students: number;
            top_performing_class: {
                class_id: any;
                class_name: any;
                average_score: number;
            } | null;
        };
        homework: {
            homework_assigned_today: number;
            pending_homework_reviews: number;
            homework_submission_rate: number;
        };
        finance: {
            total_fee_collected: number;
            outstanding_fees: number;
            overdue_invoices: number;
        };
        communication: {
            notifications_sent_today: number;
            active_message_threads: number;
            unread_notifications: number;
        };
    }>;
    getDashboardOverview(data: {
        schoolId: string;
    }): Promise<{
        students: {
            total_students: number;
            active_students: number;
            new_admissions_this_year: number;
        };
        attendance: {
            today_attendance_rate: number;
            absent_students_today: number;
            average_attendance_this_month: number;
        };
        academics: {
            exams_completed: number;
            average_exam_score: number;
            pending_signatures: number;
            at_risk_students: number;
            top_performing_class: {
                class_id: any;
                class_name: any;
                average_score: number;
            } | null;
        };
        homework: {
            homework_assigned_today: number;
            pending_homework_reviews: number;
            homework_submission_rate: number;
        };
        finance: {
            total_fee_collected: number;
            outstanding_fees: number;
            overdue_invoices: number;
        };
        communication: {
            notifications_sent_today: number;
            active_message_threads: number;
            unread_notifications: number;
        };
    }>;
}
