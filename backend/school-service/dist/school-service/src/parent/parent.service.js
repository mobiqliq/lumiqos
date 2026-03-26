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
exports.ParentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../shared/src/index");
const student_guardian_entity_1 = require("../../../shared/src/entities/student-guardian.entity");
const student_entity_1 = require("../../../shared/src/entities/student.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const student_attendance_entity_1 = require("../../../shared/src/entities/student-attendance.entity");
const homework_assignment_entity_1 = require("../../../shared/src/entities/homework-assignment.entity");
const homework_submission_entity_1 = require("../../../shared/src/entities/homework-submission.entity");
const report_card_entity_1 = require("../../../shared/src/entities/report-card.entity");
const fee_invoice_entity_1 = require("../../../shared/src/entities/fee-invoice.entity");
const fee_payment_entity_1 = require("../../../shared/src/entities/fee-payment.entity");
const notification_recipient_entity_1 = require("../../../shared/src/entities/notification-recipient.entity");
const message_thread_entity_1 = require("../../../shared/src/entities/message-thread.entity");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
let ParentService = class ParentService {
    guardianRepo;
    studentRepo;
    enrollmentRepo;
    attendanceRepo;
    assignmentRepo;
    submissionRepo;
    reportCardRepo;
    invoiceRepo;
    paymentRepo;
    notificationRepo;
    threadRepo;
    academicYearRepo;
    constructor(guardianRepo, studentRepo, enrollmentRepo, attendanceRepo, assignmentRepo, submissionRepo, reportCardRepo, invoiceRepo, paymentRepo, notificationRepo, threadRepo, academicYearRepo) {
        this.guardianRepo = guardianRepo;
        this.studentRepo = studentRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.attendanceRepo = attendanceRepo;
        this.assignmentRepo = assignmentRepo;
        this.submissionRepo = submissionRepo;
        this.reportCardRepo = reportCardRepo;
        this.invoiceRepo = invoiceRepo;
        this.paymentRepo = paymentRepo;
        this.notificationRepo = notificationRepo;
        this.threadRepo = threadRepo;
        this.academicYearRepo = academicYearRepo;
    }
    async verifyGuardianAccess(userId, studentId, schoolId) {
        const link = await this.guardianRepo.findOne({
            where: { user_id: userId, student_id: studentId, school_id: schoolId }
        });
        if (!link) {
            throw new common_1.ForbiddenException('Parent not authorized for this student');
        }
    }
    async getDashboard(userId, studentId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        await this.verifyGuardianAccess(userId, studentId, schoolId);
        const activeYear = await this.academicYearRepo.findOne({ where: { school_id: schoolId, status: 'active' } });
        if (!activeYear)
            throw new common_1.InternalServerErrorException('No active academic year');
        const enrollment = await this.enrollmentRepo.findOne({
            where: { student_id: studentId, school_id: schoolId, academic_year_id: activeYear.academic_year_id, status: 'active' },
            relations: ['class', 'section']
        });
        const studentData = await this.studentRepo.findOne({ where: { student_id: studentId } });
        const todayStr = new Date().toISOString().split('T')[0];
        const [attendanceMetrics, homeworkPending, recentNotifications, unreadMessages] = await Promise.all([
            this.attendanceRepo.createQueryBuilder('att')
                .innerJoin('att.session', 'session')
                .where('att.school_id = :schoolId', { schoolId })
                .andWhere('att.student_id = :studentId', { studentId })
                .andWhere('session.academic_year_id = :yearId', { yearId: activeYear.academic_year_id })
                .select([
                'COUNT(*) as total',
                'SUM(CASE WHEN att.status = \'present\' THEN 1 ELSE 0 END) as present_count',
                'MAX(CASE WHEN session.session_date = :today THEN att.status ELSE NULL END) as today_status'
            ])
                .setParameter('today', todayStr)
                .getRawOne(),
            this.assignmentRepo.createQueryBuilder('hw')
                .where('hw.school_id = :schoolId', { schoolId })
                .andWhere('hw.due_date >= :today', { today: todayStr })
                .andWhere('hw.class_id = :classId', { classId: enrollment?.class_id })
                .leftJoin('hw.submissions', 'sub', 'sub.student_id = :studentId', { studentId })
                .andWhere('(sub.status IS NULL OR sub.status != \'submitted\')')
                .getCount(),
            this.notificationRepo.find({
                where: { school_id: schoolId, recipient_id: userId },
                relations: ['notification'],
                order: { sent_at: 'DESC' },
                take: 5
            }),
            this.threadRepo.count({
                where: { school_id: schoolId, student_id: studentId }
            })
        ]);
        const totalAtt = Number(attendanceMetrics?.total || 0);
        const presentAtt = Number(attendanceMetrics?.present_count || 0);
        return {
            student: {
                student_id: studentId,
                name: studentData ? `${studentData.first_name} ${studentData.last_name}` : '',
                class: enrollment?.class?.class_name || '',
                section: enrollment?.section?.section_name || ''
            },
            attendance: {
                today_status: attendanceMetrics?.today_status || 'not_marked',
                monthly_percentage: totalAtt > 0 ? ((presentAtt / totalAtt) * 100).toFixed(1) : "0.0"
            },
            homework_pending: homeworkPending,
            recent_notifications: recentNotifications.map(rn => ({
                title: rn.notification.title,
                message: rn.notification.message,
                date: rn.sent_at,
                read: rn.read_status === 'read'
            })),
            unread_messages: unreadMessages
        };
    }
    async getAttendanceHistory(userId, studentId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        await this.verifyGuardianAccess(userId, studentId, schoolId);
        const activeYear = await this.academicYearRepo.findOne({ where: { school_id: schoolId, status: 'active' } });
        if (!activeYear)
            return { monthly_attendance: [], attendance_percentage: "0.0" };
        const records = await this.attendanceRepo.find({
            where: { school_id: schoolId, student_id: studentId },
            relations: ['session']
        });
        const yearRecords = records.filter(r => r.session.academic_year_id === activeYear.academic_year_id);
        const total = yearRecords.length;
        const present = yearRecords.filter(r => r.status === 'present').length;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
        const monthly = {};
        for (const r of yearRecords) {
            const dateObj = new Date(r.session.session_date);
            const month = dateObj.toISOString().substring(0, 7);
            if (!monthly[month])
                monthly[month] = { present: 0, total: 0 };
            monthly[month].total += 1;
            if (r.status === 'present')
                monthly[month].present += 1;
        }
        const monthly_attendance = Object.keys(monthly).map(k => ({
            month: k,
            percentage: ((monthly[k].present / monthly[k].total) * 100).toFixed(1)
        }));
        return { monthly_attendance, attendance_percentage: percentage };
    }
    async getHomework(userId, studentId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        await this.verifyGuardianAccess(userId, studentId, schoolId);
        const submissions = await this.submissionRepo.find({
            where: { school_id: schoolId, student_id: studentId },
            relations: ['homework']
        });
        const pending_homework = [];
        const completed_homework = [];
        const todayStr = new Date().toISOString().split('T')[0];
        submissions.forEach(sub => {
            const hw = {
                title: sub.homework.title,
                due_date: sub.homework.due_date,
                status: sub.status,
                grade: sub.grade || null,
                feedback: sub.teacher_remark || null
            };
            if (sub.status === 'submitted' || sub.status === 'graded') {
                completed_homework.push(hw);
            }
            else {
                pending_homework.push(hw);
            }
        });
        return { pending_homework, completed_homework };
    }
    async getReportCards(userId, studentId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        await this.verifyGuardianAccess(userId, studentId, schoolId);
        return await this.reportCardRepo.createQueryBuilder('rc')
            .innerJoinAndSelect('rc.exam', 'exam')
            .leftJoinAndSelect('rc.subjects', 'subjects')
            .leftJoinAndSelect('subjects.subject', 'subDetail')
            .where('rc.school_id = :schoolId', { schoolId })
            .andWhere('rc.student_id = :studentId', { studentId })
            .andWhere('exam.status = :published', { published: 'published' })
            .getMany();
    }
    async getFees(userId, studentId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        await this.verifyGuardianAccess(userId, studentId, schoolId);
        const [paidRaw, pendingRaw] = await Promise.all([
            this.paymentRepo.createQueryBuilder('p')
                .innerJoin('p.invoice', 'inv')
                .where('p.school_id = :schoolId', { schoolId })
                .andWhere('inv.student_id = :studentId', { studentId })
                .select('SUM(p.amount)', 'paid')
                .getRawOne(),
            this.invoiceRepo.createQueryBuilder('inv')
                .where('inv.school_id = :schoolId', { schoolId })
                .andWhere('inv.student_id = :studentId', { studentId })
                .select('SUM(inv.remaining_balance)', 'pending')
                .getRawOne()
        ]);
        const paid = Number(paidRaw?.paid || 0);
        const pending = Number(pendingRaw?.pending || 0);
        const todayStr = new Date().toISOString().split('T')[0];
        const overdueRaw = await this.invoiceRepo.createQueryBuilder('inv')
            .where('inv.school_id = :schoolId', { schoolId })
            .andWhere('inv.student_id = :studentId', { studentId })
            .andWhere('inv.remaining_balance > 0')
            .andWhere('inv.due_date < :today', { today: todayStr })
            .select('SUM(inv.remaining_balance)', 'overdue')
            .getRawOne();
        const overdue = Number(overdueRaw?.overdue || 0);
        const recent_payments = await this.paymentRepo.createQueryBuilder('p')
            .innerJoin('p.invoice', 'inv')
            .where('p.school_id = :schoolId', { schoolId })
            .andWhere('inv.student_id = :studentId', { studentId })
            .orderBy('p.paid_at', 'DESC')
            .limit(10)
            .getMany();
        return {
            total_fee: paid + pending,
            paid,
            pending,
            overdue,
            recent_payments
        };
    }
    async getNotifications(userId, limit, offset) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        return await this.notificationRepo.find({
            where: { school_id: schoolId, user_id: userId },
            relations: ['notification'],
            order: { sent_at: 'DESC' },
            take: limit,
            skip: offset
        });
    }
    async getMessages(userId, studentId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        await this.verifyGuardianAccess(userId, studentId, schoolId);
        return await this.threadRepo.find({
            where: { school_id: schoolId, student_id: studentId },
            relations: ['teacher']
        });
    }
};
exports.ParentService = ParentService;
exports.ParentService = ParentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_guardian_entity_1.StudentGuardian)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(2, (0, typeorm_1.InjectRepository)(student_enrollment_entity_1.StudentEnrollment)),
    __param(3, (0, typeorm_1.InjectRepository)(student_attendance_entity_1.StudentAttendance)),
    __param(4, (0, typeorm_1.InjectRepository)(homework_assignment_entity_1.HomeworkAssignment)),
    __param(5, (0, typeorm_1.InjectRepository)(homework_submission_entity_1.HomeworkSubmission)),
    __param(6, (0, typeorm_1.InjectRepository)(report_card_entity_1.ReportCard)),
    __param(7, (0, typeorm_1.InjectRepository)(fee_invoice_entity_1.FeeInvoice)),
    __param(8, (0, typeorm_1.InjectRepository)(fee_payment_entity_1.FeePayment)),
    __param(9, (0, typeorm_1.InjectRepository)(notification_recipient_entity_1.NotificationRecipient)),
    __param(10, (0, typeorm_1.InjectRepository)(message_thread_entity_1.MessageThread)),
    __param(11, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
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
        typeorm_2.Repository])
], ParentService);
//# sourceMappingURL=parent.service.js.map