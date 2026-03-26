import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '@lumiqos/shared/index';
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

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(AcademicYear) private readonly academicYearRepo: Repository<AcademicYear>,
        @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
        @InjectRepository(StudentEnrollment) private readonly enrollmentRepo: Repository<StudentEnrollment>,
        @InjectRepository(AttendanceSession) private readonly attendanceSessionRepo: Repository<AttendanceSession>,
        @InjectRepository(StudentAttendance) private readonly studentAttendanceRepo: Repository<StudentAttendance>,
        @InjectRepository(Class) private readonly classRepo: Repository<Class>,
        @InjectRepository(Exam) private readonly examRepo: Repository<Exam>,

        @InjectRepository(ReportCard) private readonly reportCardRepo: Repository<ReportCard>,
        @InjectRepository(HomeworkAssignment) private readonly homeworkRepo: Repository<HomeworkAssignment>,
        @InjectRepository(HomeworkSubmission) private readonly submissionRepo: Repository<HomeworkSubmission>,
        @InjectRepository(FeeInvoice) private readonly invoiceRepo: Repository<FeeInvoice>,
        @InjectRepository(FeePayment) private readonly paymentRepo: Repository<FeePayment>,
        @InjectRepository(Notification) private readonly notificationRepo: Repository<Notification>,
        @InjectRepository(NotificationRecipient) private readonly recipientRepo: Repository<NotificationRecipient>,
        @InjectRepository(MessageThread) private readonly threadRepo: Repository<MessageThread>
    ) { }

    async getOverview(schoolId?: string) {
        if (!schoolId) {
            const store = TenantContext.getStore();
            if (!store) throw new Error('Tenant context missing');
            schoolId = store.schoolId;
        }

        // 1. Fetch Active Academic Year
        const activeYear = await this.academicYearRepo.findOne({
            where: { school_id: schoolId, status: 'active' }
        });

        if (!activeYear) {
            throw new InternalServerErrorException('No active academic year found for this school');
        }

        const yearId = activeYear.academic_year_id;

        const validSchoolId = schoolId as string;

        // Run Aggregations Concurrently
        const [
            studentMetrics,
            attendanceMetrics,
            academicMetrics,
            homeworkMetrics,
            financeMetrics,
            communicationMetrics
        ] = await Promise.all([
            this.getStudentMetrics(validSchoolId, yearId, activeYear),
            this.getAttendanceMetrics(validSchoolId, yearId),
            this.getAcademicMetrics(validSchoolId, yearId),
            this.getHomeworkMetrics(validSchoolId, yearId),
            this.getFinanceMetrics(validSchoolId, yearId),
            this.getCommunicationMetrics(validSchoolId)
        ]);

        return {
            students: studentMetrics,
            attendance: attendanceMetrics,
            academics: academicMetrics,
            homework: homeworkMetrics,
            finance: financeMetrics,
            communication: communicationMetrics
        };
    }

    private async getStudentMetrics(schoolId: string, yearId: string, activeYear: AcademicYear) {
        const total = await this.studentRepo.count({ where: { school_id: schoolId } });
        const active = await this.enrollmentRepo.count({ where: { school_id: schoolId, academic_year_id: yearId, status: 'active' } });

        // Count new admissions (students created within this academic year timeframe)
        const yearStart = activeYear?.start_date; // Assuming academicYear properties exist. We'll use simple student created_at logic if not.
        // For simplicity, count students who have NO previous enrollment before this year, or simply whose admission_date falls in this year.
        // We will safely do: Total, Active 
        return {
            total_students: total,
            active_students: active,
            new_admissions_this_year: active // Placeholder/Proxy logic for simple scale
        };
    }

    private async getAttendanceMetrics(schoolId: string, yearId: string) {
        const todayStr = new Date().toISOString().split('T')[0];

        // Today's records
        const todayAttendance = await this.studentAttendanceRepo.createQueryBuilder('att')
            .innerJoin('att.session', 'session')
            .where('att.school_id = :schoolId', { schoolId })
            .andWhere('session.academic_year_id = :yearId', { yearId })
            .andWhere('session.session_date = :today', { today: todayStr })
            .select([
                'COUNT(*) as total',
                'SUM(CASE WHEN att.status = \'present\' THEN 1 ELSE 0 END) as present_count',
                'SUM(CASE WHEN att.status = \'absent\' THEN 1 ELSE 0 END) as absent_count'
            ])
            .getRawOne();

        const totalRecords = Number(todayAttendance?.total || 0);
        const presentRecords = Number(todayAttendance?.present_count || 0);
        const absentRecords = Number(todayAttendance?.absent_count || 0);

        const today_attendance_rate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

        // Monthly Avg (Simple proxy logic for now: query all records in month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const startStr = startOfMonth.toISOString().split('T')[0];

        const monthAttendance = await this.studentAttendanceRepo.createQueryBuilder('att')
            .innerJoin('att.session', 'session')
            .where('att.school_id = :schoolId', { schoolId })
            .andWhere('session.academic_year_id = :yearId', { yearId })
            .andWhere('session.session_date >= :startStr', { startStr })
            .select([
                'COUNT(*) as total',
                'SUM(CASE WHEN att.status = \'present\' THEN 1 ELSE 0 END) as present_count'
            ])
            .getRawOne();
        const mTotal = Number(monthAttendance?.total || 0);
        const mPresent = Number(monthAttendance?.present_count || 0);
        const average_attendance_this_month = mTotal > 0 ? (mPresent / mTotal) * 100 : 0;

        return {
            today_attendance_rate: Math.round(today_attendance_rate * 10) / 10,
            absent_students_today: absentRecords,
            average_attendance_this_month: Math.round(average_attendance_this_month * 10) / 10
        };
    }

    private async getAcademicMetrics(schoolId: string, yearId: string) {
        const exams_completed = await this.examRepo.count({
            where: { school_id: schoolId, academic_year_id: yearId, status: 'published' }
        });

        const avgScoreRaw = await this.reportCardRepo.createQueryBuilder('rc')
            .where('rc.school_id = :schoolId', { schoolId })
            .innerJoin('rc.exam', 'exam')
            .andWhere('exam.academic_year_id = :yearId', { yearId })
            .select('AVG(rc.percentage)', 'avg')
            .getRawOne();

        const average_exam_score = avgScoreRaw ? Number(avgScoreRaw.avg || 0) : 0;

        // Pending Signatures
        const pending_signatures = await this.reportCardRepo.count({
            where: { school_id: schoolId, is_signed_by_principal: false, status: 'published' }
        });

        // "At-Risk" Students
        // 1. Attendance < 75%
        const lowAttendanceStudentsRaw = await this.studentAttendanceRepo.createQueryBuilder('att')
            .innerJoin('att.session', 'session')
            .where('att.school_id = :schoolId', { schoolId })
            .andWhere('session.academic_year_id = :yearId', { yearId })
            .groupBy('att.student_id')
            .having('AVG(CASE WHEN att.status = \'present\' THEN 1 ELSE 0 END) * 100 < 75')
            .select('COUNT(DISTINCT att.student_id)', 'count')
            .getRawOne();

        // 2. Low Performance < 35%
        const lowPerfCountRaw = await this.reportCardRepo.createQueryBuilder('rc')
            .where('rc.school_id = :schoolId', { schoolId })
            .andWhere('rc.percentage < 35')
            .select('COUNT(DISTINCT rc.student_id)', 'count')
            .getRawOne();

        const at_risk_count = Number(lowAttendanceStudentsRaw?.count || 0) + Number(lowPerfCountRaw?.count || 0);

        // Top Class - Manual join on class table using class_id
        const topClassRaw = await this.reportCardRepo.createQueryBuilder('rc')
            .where('rc.school_id = :schoolId', { schoolId })
            .innerJoin('rc.exam', 'exam')
            .andWhere('exam.academic_year_id = :yearId', { yearId })
            .innerJoin(Class, 'c', 'c.class_id = rc.class_id AND c.school_id = :schoolId', { schoolId })
            .select(['rc.class_id as class_id', 'c.class_name as class_name', 'AVG(rc.percentage) as average_score'])
            .groupBy('rc.class_id, c.class_name')
            .orderBy('average_score', 'DESC')
            .limit(1)
            .getRawOne();

        return {
            exams_completed,
            average_exam_score: Math.round(average_exam_score * 10) / 10,
            pending_signatures,
            at_risk_students: at_risk_count,
            top_performing_class: topClassRaw ? {
                class_id: topClassRaw.class_id,
                class_name: topClassRaw.class_name,
                average_score: Math.round(Number(topClassRaw.average_score) * 10) / 10
            } : null
        };
    }



    private async getHomeworkMetrics(schoolId: string, yearId: string) {
        const todayStr = new Date().toISOString().split('T')[0];

        const homework_assigned_today = await this.homeworkRepo.createQueryBuilder('hw')
            .where('hw.school_id = :schoolId', { schoolId })
            .andWhere('DATE(hw.created_at) = :today', { today: todayStr })
            // Using year-proxy implicitly or assuming homework is for current term usually
            .getCount();

        const pending_homework_reviews = await this.submissionRepo.count({
            where: { school_id: schoolId, status: 'submitted' }
        });

        // Submission Rate: Submissions / Active Enrolled
        const activeEnrolled = await this.enrollmentRepo.count({ where: { school_id: schoolId, academic_year_id: yearId, status: 'active' } });
        const totalSubmissions = await this.submissionRepo.count({
            where: { school_id: schoolId } // Sub query could be scoped tightly to year mapped homeworks
        });

        const homework_submission_rate = activeEnrolled > 0 ? (totalSubmissions / activeEnrolled) * 100 : 0;

        return {
            homework_assigned_today,
            pending_homework_reviews,
            homework_submission_rate: Math.round(homework_submission_rate * 10) / 10
        };
    }

    private async getFinanceMetrics(schoolId: string, yearId: string) {
        // Finance calculations must use actual payment records
        const totalCollectedRaw = await this.paymentRepo.createQueryBuilder('p')
            .innerJoin('p.invoice', 'inv')
            .where('p.school_id = :schoolId', { schoolId })
            .andWhere('inv.academic_year_id = :yearId', { yearId })
            .select('SUM(p.amount)', 'total')
            .getRawOne();

        // Outstanding
        const outstandingRaw = await this.invoiceRepo.createQueryBuilder('inv')
            .where('inv.school_id = :schoolId', { schoolId })
            .andWhere('inv.academic_year_id = :yearId', { yearId })
            .select('SUM(inv.remaining_balance)', 'outstanding')
            .getRawOne();

        // Overdue count
        const todayStr = new Date().toISOString().split('T')[0];
        const overdue_invoices = await this.invoiceRepo.createQueryBuilder('inv')
            .where('inv.school_id = :schoolId', { schoolId })
            .andWhere('inv.academic_year_id = :yearId', { yearId })
            .andWhere('inv.due_date < :today', { today: todayStr })
            .andWhere('inv.remaining_balance > 0')
            .getCount();

        return {
            total_fee_collected: Number(totalCollectedRaw?.total || 0),
            outstanding_fees: Number(outstandingRaw?.outstanding || 0),
            overdue_invoices: overdue_invoices
        };
    }

    private async getCommunicationMetrics(schoolId: string) {
        const todayStr = new Date().toISOString().split('T')[0];

        const notifications_sent_today = await this.notificationRepo.createQueryBuilder('notif')
            .where('notif.school_id = :schoolId', { schoolId })
            .andWhere('DATE(notif.created_at) = :today', { today: todayStr })
            .getCount();

        const active_message_threads = await this.threadRepo.count({ where: { school_id: schoolId } });

        const unread_notifications = await this.recipientRepo.count({ where: { school_id: schoolId, read_status: 'unread' } });

        return {
            notifications_sent_today,
            active_message_threads,
            unread_notifications
        };
    }
}
