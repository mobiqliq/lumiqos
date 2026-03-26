import { Repository } from 'typeorm';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { Student } from '@lumiqos/shared/src/entities/student.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { AttendanceSession } from '@lumiqos/shared/src/entities/attendance-session.entity';
import { StudentAttendance } from '@lumiqos/shared/src/entities/student-attendance.entity';
import { Exam } from '@lumiqos/shared/src/entities/exam.entity';
import { ReportCard } from '@lumiqos/shared/src/entities/report-card.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { HomeworkAssignment } from '@lumiqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@lumiqos/shared/src/entities/homework-submission.entity';
import { FeeInvoice } from '@lumiqos/shared/src/entities/fee-invoice.entity';
import { FeePayment } from '@lumiqos/shared/src/entities/fee-payment.entity';
import { Notification } from '@lumiqos/shared/src/entities/notification.entity';
import { MessageThread } from '@lumiqos/shared/src/entities/message-thread.entity';
import { NotificationRecipient } from '@lumiqos/shared/src/entities/notification-recipient.entity';
export declare class DashboardService {
    private readonly academicYearRepo;
    private readonly studentRepo;
    private readonly enrollmentRepo;
    private readonly attendanceSessionRepo;
    private readonly studentAttendanceRepo;
    private readonly classRepo;
    private readonly examRepo;
    private readonly reportCardRepo;
    private readonly homeworkRepo;
    private readonly submissionRepo;
    private readonly invoiceRepo;
    private readonly paymentRepo;
    private readonly notificationRepo;
    private readonly recipientRepo;
    private readonly threadRepo;
    constructor(academicYearRepo: Repository<AcademicYear>, studentRepo: Repository<Student>, enrollmentRepo: Repository<StudentEnrollment>, attendanceSessionRepo: Repository<AttendanceSession>, studentAttendanceRepo: Repository<StudentAttendance>, classRepo: Repository<Class>, examRepo: Repository<Exam>, reportCardRepo: Repository<ReportCard>, homeworkRepo: Repository<HomeworkAssignment>, submissionRepo: Repository<HomeworkSubmission>, invoiceRepo: Repository<FeeInvoice>, paymentRepo: Repository<FeePayment>, notificationRepo: Repository<Notification>, recipientRepo: Repository<NotificationRecipient>, threadRepo: Repository<MessageThread>);
    getOverview(schoolId?: string): Promise<{
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
    private getStudentMetrics;
    private getAttendanceMetrics;
    private getAcademicMetrics;
    private getHomeworkMetrics;
    private getFinanceMetrics;
    private getCommunicationMetrics;
}
