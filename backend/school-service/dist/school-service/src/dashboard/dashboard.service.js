"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../shared/src/index");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
const student_entity_1 = require("../../../shared/src/entities/student.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const attendance_session_entity_1 = require("../../../shared/src/entities/attendance-session.entity");
const student_attendance_entity_1 = require("../../../shared/src/entities/student-attendance.entity");
const exam_entity_1 = require("../../../shared/src/entities/exam.entity");
const report_card_entity_1 = require("../../../shared/src/entities/report-card.entity");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const homework_assignment_entity_1 = require("../../../shared/src/entities/homework-assignment.entity");
const homework_submission_entity_1 = require("../../../shared/src/entities/homework-submission.entity");
const fee_invoice_entity_1 = require("../../../shared/src/entities/fee-invoice.entity");
const fee_payment_entity_1 = require("../../../shared/src/entities/fee-payment.entity");
const notification_entity_1 = require("../../../shared/src/entities/notification.entity");
const message_thread_entity_1 = require("../../../shared/src/entities/message-thread.entity");
const notification_recipient_entity_1 = require("../../../shared/src/entities/notification-recipient.entity");
let DashboardService = class DashboardService {
    academicYearRepo;
    studentRepo;
    enrollmentRepo;
    attendanceSessionRepo;
    studentAttendanceRepo;
    classRepo;
    examRepo;
    reportCardRepo;
    homeworkRepo;
    submissionRepo;
    invoiceRepo;
    paymentRepo;
    notificationRepo;
    recipientRepo;
    threadRepo;
    constructor(academicYearRepo, studentRepo, enrollmentRepo, attendanceSessionRepo, studentAttendanceRepo, classRepo, examRepo, reportCardRepo, homeworkRepo, submissionRepo, invoiceRepo, paymentRepo, notificationRepo, recipientRepo, threadRepo) {
        this.academicYearRepo = academicYearRepo;
        this.studentRepo = studentRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.attendanceSessionRepo = attendanceSessionRepo;
        this.studentAttendanceRepo = studentAttendanceRepo;
        this.classRepo = classRepo;
        this.examRepo = examRepo;
        this.reportCardRepo = reportCardRepo;
        this.homeworkRepo = homeworkRepo;
        this.submissionRepo = submissionRepo;
        this.invoiceRepo = invoiceRepo;
        this.paymentRepo = paymentRepo;
        this.notificationRepo = notificationRepo;
        this.recipientRepo = recipientRepo;
        this.threadRepo = threadRepo;
    }
    async getOverview(schoolId) {
        if (!schoolId) {
            const store = index_1.TenantContext.getStore();
            if (!store)
                throw new Error('Tenant context missing');
            schoolId = store.schoolId;
        }
        const activeYear = await this.academicYearRepo.findOne({
            where: { school_id: schoolId, status: 'active' }
        });
        if (!activeYear) {
            throw new common_1.InternalServerErrorException('No active academic year found for this school');
        }
        const yearId = activeYear.academic_year_id;
        const validSchoolId = schoolId;
        const [studentMetrics, attendanceMetrics, academicMetrics, homeworkMetrics, financeMetrics, communicationMetrics] = await Promise.all([
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
    async getStudentMetrics(schoolId, yearId, activeYear) {
        const total = await this.studentRepo.count({ where: { school_id: schoolId } });
        const active = await this.enrollmentRepo.count({ where: { school_id: schoolId, academic_year_id: yearId, status: 'active' } });
        const yearStart = activeYear?.start_date;
        return {
            total_students: total,
            active_students: active,
            new_admissions_this_year: active
        };
    }
    async getAttendanceMetrics(schoolId, yearId) {
        const todayStr = new Date().toISOString().split('T')[0];
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
    async getAcademicMetrics(schoolId, yearId) {
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
        const pending_signatures = await this.reportCardRepo.count({
            where: { school_id: schoolId, is_signed_by_principal: false, status: 'published' }
        });
        const lowAttendanceStudentsRaw = await this.studentAttendanceRepo.createQueryBuilder('att')
            .innerJoin('att.session', 'session')
            .where('att.school_id = :schoolId', { schoolId })
            .andWhere('session.academic_year_id = :yearId', { yearId })
            .groupBy('att.student_id')
            .having('AVG(CASE WHEN att.status = \'present\' THEN 1 ELSE 0 END) * 100 < 75')
            .select('COUNT(DISTINCT att.student_id)', 'count')
            .getRawOne();
        const lowPerfCountRaw = await this.reportCardRepo.createQueryBuilder('rc')
            .where('rc.school_id = :schoolId', { schoolId })
            .andWhere('rc.percentage < 35')
            .select('COUNT(DISTINCT rc.student_id)', 'count')
            .getRawOne();
        const at_risk_count = Number(lowAttendanceStudentsRaw?.count || 0) + Number(lowPerfCountRaw?.count || 0);
        const topClassRaw = await this.reportCardRepo.createQueryBuilder('rc')
            .where('rc.school_id = :schoolId', { schoolId })
            .innerJoin('rc.exam', 'exam')
            .andWhere('exam.academic_year_id = :yearId', { yearId })
            .innerJoin(class_entity_1.Class, 'c', 'c.class_id = rc.class_id AND c.school_id = :schoolId', { schoolId })
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
    async getHomeworkMetrics(schoolId, yearId) {
        const todayStr = new Date().toISOString().split('T')[0];
        const homework_assigned_today = await this.homeworkRepo.createQueryBuilder('hw')
            .where('hw.school_id = :schoolId', { schoolId })
            .andWhere('DATE(hw.created_at) = :today', { today: todayStr })
            .getCount();
        const pending_homework_reviews = await this.submissionRepo.count({
            where: { school_id: schoolId, status: 'submitted' }
        });
        const activeEnrolled = await this.enrollmentRepo.count({ where: { school_id: schoolId, academic_year_id: yearId, status: 'active' } });
        const totalSubmissions = await this.submissionRepo.count({
            where: { school_id: schoolId }
        });
        const homework_submission_rate = activeEnrolled > 0 ? (totalSubmissions / activeEnrolled) * 100 : 0;
        return {
            homework_assigned_today,
            pending_homework_reviews,
            homework_submission_rate: Math.round(homework_submission_rate * 10) / 10
        };
    }
    async getFinanceMetrics(schoolId, yearId) {
        const totalCollectedRaw = await this.paymentRepo.createQueryBuilder('p')
            .innerJoin('p.invoice', 'inv')
            .where('p.school_id = :schoolId', { schoolId })
            .andWhere('inv.academic_year_id = :yearId', { yearId })
            .select('SUM(p.amount)', 'total')
            .getRawOne();
        const outstandingRaw = await this.invoiceRepo.createQueryBuilder('inv')
            .where('inv.school_id = :schoolId', { schoolId })
            .andWhere('inv.academic_year_id = :yearId', { yearId })
            .select('SUM(inv.remaining_balance)', 'outstanding')
            .getRawOne();
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
    async getCommunicationMetrics(schoolId) {
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(2, (0, typeorm_1.InjectRepository)(student_enrollment_entity_1.StudentEnrollment)),
    __param(3, (0, typeorm_1.InjectRepository)(attendance_session_entity_1.AttendanceSession)),
    __param(4, (0, typeorm_1.InjectRepository)(student_attendance_entity_1.StudentAttendance)),
    __param(5, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(6, (0, typeorm_1.InjectRepository)(exam_entity_1.Exam)),
    __param(7, (0, typeorm_1.InjectRepository)(report_card_entity_1.ReportCard)),
    __param(8, (0, typeorm_1.InjectRepository)(homework_assignment_entity_1.HomeworkAssignment)),
    __param(9, (0, typeorm_1.InjectRepository)(homework_submission_entity_1.HomeworkSubmission)),
    __param(10, (0, typeorm_1.InjectRepository)(fee_invoice_entity_1.FeeInvoice)),
    __param(11, (0, typeorm_1.InjectRepository)(fee_payment_entity_1.FeePayment)),
    __param(12, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(13, (0, typeorm_1.InjectRepository)(notification_recipient_entity_1.NotificationRecipient)),
    __param(14, (0, typeorm_1.InjectRepository)(message_thread_entity_1.MessageThread)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map