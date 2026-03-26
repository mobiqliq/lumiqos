import { Repository } from 'typeorm';
import { StudentGuardian } from '@lumiqos/shared/src/entities/student-guardian.entity';
import { Student } from '@lumiqos/shared/src/entities/student.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { StudentAttendance } from '@lumiqos/shared/src/entities/student-attendance.entity';
import { HomeworkAssignment } from '@lumiqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@lumiqos/shared/src/entities/homework-submission.entity';
import { ReportCard } from '@lumiqos/shared/src/entities/report-card.entity';
import { FeeInvoice } from '@lumiqos/shared/src/entities/fee-invoice.entity';
import { FeePayment } from '@lumiqos/shared/src/entities/fee-payment.entity';
import { NotificationRecipient } from '@lumiqos/shared/src/entities/notification-recipient.entity';
import { MessageThread } from '@lumiqos/shared/src/entities/message-thread.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
export declare class ParentService {
    private readonly guardianRepo;
    private readonly studentRepo;
    private readonly enrollmentRepo;
    private readonly attendanceRepo;
    private readonly assignmentRepo;
    private readonly submissionRepo;
    private readonly reportCardRepo;
    private readonly invoiceRepo;
    private readonly paymentRepo;
    private readonly notificationRepo;
    private readonly threadRepo;
    private readonly academicYearRepo;
    constructor(guardianRepo: Repository<StudentGuardian>, studentRepo: Repository<Student>, enrollmentRepo: Repository<StudentEnrollment>, attendanceRepo: Repository<StudentAttendance>, assignmentRepo: Repository<HomeworkAssignment>, submissionRepo: Repository<HomeworkSubmission>, reportCardRepo: Repository<ReportCard>, invoiceRepo: Repository<FeeInvoice>, paymentRepo: Repository<FeePayment>, notificationRepo: Repository<NotificationRecipient>, threadRepo: Repository<MessageThread>, academicYearRepo: Repository<AcademicYear>);
    private verifyGuardianAccess;
    getDashboard(userId: string, studentId: string): Promise<{
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
    getAttendanceHistory(userId: string, studentId: string): Promise<{
        monthly_attendance: {
            month: string;
            percentage: string;
        }[];
        attendance_percentage: string;
    }>;
    getHomework(userId: string, studentId: string): Promise<{
        pending_homework: any[];
        completed_homework: any[];
    }>;
    getReportCards(userId: string, studentId: string): Promise<ReportCard[]>;
    getFees(userId: string, studentId: string): Promise<{
        total_fee: number;
        paid: number;
        pending: number;
        overdue: number;
        recent_payments: FeePayment[];
    }>;
    getNotifications(userId: string, limit: number, offset: number): Promise<NotificationRecipient[]>;
    getMessages(userId: string, studentId: string): Promise<MessageThread[]>;
}
