import { ParentService } from './parent.service';
export declare class ParentController {
    private readonly parentService;
    constructor(parentService: ParentService);
    getDashboard(req: any, studentId: string): Promise<{
        student: {
            student_id: string;
            name: string;
            class: string;
            section: string;
        };
        attendance: {
            today_status: any;
            monthly_percentage: string;
        };
        homework_pending: number;
        recent_notifications: {
            title: string;
            message: string;
            date: Date;
            read: boolean;
        }[];
        unread_messages: number;
    }>;
    getAttendance(req: any, studentId: string): Promise<{
        monthly_attendance: {
            month: string;
            percentage: string;
        }[];
        attendance_percentage: string;
    }>;
    getHomework(req: any, studentId: string): Promise<{
        pending_homework: any[];
        completed_homework: any[];
    }>;
    getReportCards(req: any, studentId: string): Promise<import("@lumiqos/shared/index").ReportCard[]>;
    getFees(req: any, studentId: string): Promise<{
        total_fee: number;
        paid: number;
        pending: number;
        overdue: number;
        recent_payments: import("@lumiqos/shared/index").FeePayment[];
    }>;
    getNotifications(req: any, limit?: number, offset?: number): Promise<import("@lumiqos/shared/index").NotificationRecipient[]>;
    getMessages(req: any, studentId: string): Promise<import("@lumiqos/shared/index").MessageThread[]>;
}
