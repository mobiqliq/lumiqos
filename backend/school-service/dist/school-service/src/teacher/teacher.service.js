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
exports.TeacherService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../shared/src/index");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
const homework_assignment_entity_1 = require("../../../shared/src/entities/homework-assignment.entity");
const homework_submission_entity_1 = require("../../../shared/src/entities/homework-submission.entity");
const message_thread_entity_1 = require("../../../shared/src/entities/message-thread.entity");
const message_entity_1 = require("../../../shared/src/entities/message.entity");
const attendance_session_entity_1 = require("../../../shared/src/entities/attendance-session.entity");
const student_attendance_entity_1 = require("../../../shared/src/entities/student-attendance.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
const user_entity_1 = require("../../../shared/src/entities/user.entity");
let TeacherService = class TeacherService {
    teacherSubjectRepo;
    homeworkRepo;
    submissionRepo;
    threadRepo;
    messageRepo;
    attendanceSessionRepo;
    studentAttendanceRepo;
    enrollmentRepo;
    academicYearRepo;
    userRepo;
    dataSource;
    constructor(teacherSubjectRepo, homeworkRepo, submissionRepo, threadRepo, messageRepo, attendanceSessionRepo, studentAttendanceRepo, enrollmentRepo, academicYearRepo, userRepo, dataSource) {
        this.teacherSubjectRepo = teacherSubjectRepo;
        this.homeworkRepo = homeworkRepo;
        this.submissionRepo = submissionRepo;
        this.threadRepo = threadRepo;
        this.messageRepo = messageRepo;
        this.attendanceSessionRepo = attendanceSessionRepo;
        this.studentAttendanceRepo = studentAttendanceRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.academicYearRepo = academicYearRepo;
        this.userRepo = userRepo;
        this.dataSource = dataSource;
    }
    async getDashboard(teacherId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const [pendingHomework, unreadMessages, schedule] = await Promise.all([
            this.submissionRepo.createQueryBuilder('sub')
                .innerJoin('sub.homework', 'hw')
                .where('sub.school_id = :schoolId', { schoolId })
                .andWhere('sub.status = :status', { status: 'submitted' })
                .andWhere('hw.teacher_id = :teacherId', { teacherId })
                .getCount(),
            this.threadRepo.count({
                where: { school_id: schoolId, teacher_id: teacherId }
            }),
            this.teacherSubjectRepo.find({
                where: { school_id: schoolId, teacher_id: teacherId },
                relations: ['class', 'section', 'subject']
            })
        ]);
        return {
            today_schedule: schedule.map(s => ({
                class_name: s.class.class_name,
                section_name: s.section.section_name,
                subject_name: s.subject.subject_name
            })),
            pending_homework_reviews: pendingHomework,
            pending_grading: pendingHomework,
            unread_parent_messages: unreadMessages
        };
    }
    async getClasses(teacherId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const subjects = await this.teacherSubjectRepo.find({
            where: { school_id: schoolId, teacher_id: teacherId },
            relations: ['class', 'section', 'subject']
        });
        return subjects.map(s => ({
            class_id: s.class_id,
            section_id: s.section_id,
            subject_id: s.subject_id,
            class_name: s.class.class_name,
            section_name: s.section.section_name,
            subject_name: s.subject.subject_name
        }));
    }
    async submitQuickAttendance(teacherId, payload) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const { class_id, section_id, subject_id, date, attendance } = payload;
        const activeYear = await this.academicYearRepo.findOne({ where: { school_id: schoolId, status: 'active' } });
        if (!activeYear)
            throw new common_1.InternalServerErrorException('No active academic year');
        const existingSession = await this.attendanceSessionRepo.findOne({
            where: {
                school_id: schoolId,
                class_id,
                section_id,
                subject_id,
                session_date: date
            }
        });
        if (existingSession)
            throw new common_1.BadRequestException('Attendance already recorded for this session');
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const activeEnrollments = await queryRunner.manager.find(student_enrollment_entity_1.StudentEnrollment, {
                where: {
                    school_id: schoolId,
                    academic_year_id: activeYear.academic_year_id,
                    class_id,
                    section_id,
                    status: 'active'
                }
            });
            if (activeEnrollments.length === 0)
                throw new common_1.BadRequestException('No active students found');
            const session = queryRunner.manager.create(attendance_session_entity_1.AttendanceSession, {
                school_id: schoolId,
                class_id,
                section_id,
                academic_year_id: activeYear.academic_year_id,
                subject_id: subject_id || null,
                session_date: date,
                recorded_by: teacherId
            });
            await queryRunner.manager.save(session);
            const exceptionMap = new Map();
            if (attendance && Array.isArray(attendance)) {
                for (const ex of attendance) {
                    exceptionMap.set(ex.student_id, ex.status);
                }
            }
            const attendanceRecords = activeEnrollments.map(enr => {
                return queryRunner.manager.create(student_attendance_entity_1.StudentAttendance, {
                    school_id: schoolId,
                    session_id: session.session_id,
                    student_id: enr.student_id,
                    status: exceptionMap.has(enr.student_id) ? exceptionMap.get(enr.student_id) : 'present'
                });
            });
            await queryRunner.manager.save(attendanceRecords);
            await queryRunner.commitTransaction();
            return { message: 'Quick attendance saved successfully', total_students_processed: attendanceRecords.length };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async assignQuickHomework(teacherId, payload) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const { class_id, section_id, subject_id, title, due_date, attachment_url } = payload;
        const isAssigned = await this.teacherSubjectRepo.findOne({
            where: {
                school_id: schoolId,
                teacher_id: teacherId,
                class_id,
                subject_id
            }
        });
        if (!isAssigned) {
            throw new common_1.ForbiddenException('Teacher not assigned to this class or subject');
        }
        const hw = this.homeworkRepo.create({
            school_id: schoolId,
            teacher_id: teacherId,
            class_id,
            section_id,
            subject_id,
            title,
            due_date,
            attachment_url,
            assigned_date: new Date().toISOString().split('T')[0]
        });
        await this.homeworkRepo.save(hw);
        return { message: 'Homework quick assigned', homework_id: hw.homework_id };
    }
    async getHomeworkSubmissions(teacherId, limit = 25, offset = 0) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const submissions = await this.submissionRepo.createQueryBuilder('sub')
            .innerJoin('sub.homework', 'hw')
            .innerJoinAndSelect('sub.student', 'st')
            .where('sub.school_id = :schoolId', { schoolId })
            .andWhere('sub.status = :status', { status: 'submitted' })
            .andWhere('hw.teacher_id = :teacherId', { teacherId })
            .limit(limit)
            .offset(offset)
            .getMany();
        return submissions;
    }
    async submitGrade(teacherId, payload) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const { submission_id, grade, teacher_feedback } = payload;
        const sub = await this.submissionRepo.findOne({
            where: { submission_id, school_id: schoolId },
            relations: ['homework']
        });
        if (!sub)
            throw new common_1.NotFoundException('Submission not found');
        if (sub.homework.teacher_id !== teacherId)
            throw new common_1.ForbiddenException('Unauthorized grading bounds');
        sub.status = 'graded';
        sub.grade = grade;
        sub.teacher_remark = teacher_feedback;
        sub.graded_at = new Date();
        await this.submissionRepo.save(sub);
        return { message: 'Submission graded securely' };
    }
    async getMessages(teacherId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const threads = await this.threadRepo.find({
            where: { school_id: schoolId, teacher_id: teacherId },
            relations: ['student']
        });
        const threadIds = threads.map(t => t.thread_id);
        if (threadIds.length === 0)
            return [];
        const latestMsgs = await this.messageRepo.createQueryBuilder('m')
            .where('m.school_id = :schoolId', { schoolId })
            .andWhere('m.thread_id IN (:...threadIds)', { threadIds })
            .orderBy('m.created_at', 'DESC')
            .limit(500)
            .getMany();
        const msgMap = new Map();
        latestMsgs.forEach(m => {
            if (!msgMap.has(m.thread_id)) {
                msgMap.set(m.thread_id, m);
            }
        });
        return threads.map(t => {
            const latest = msgMap.get(t.thread_id);
            return {
                thread_id: t.thread_id,
                student_name: t.student ? `${t.student.first_name} ${t.student.last_name}` : 'Unknown',
                latest_message: latest ? latest.message_body : 'No messages',
                last_updated: latest ? latest.created_at : t.created_at
            };
        });
    }
    async getTeachers(schoolId) {
        return this.userRepo.find({
            where: { school_id: schoolId }
        });
    }
};
exports.TeacherService = TeacherService;
exports.TeacherService = TeacherService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(teacher_subject_entity_1.TeacherSubject)),
    __param(1, (0, typeorm_1.InjectRepository)(homework_assignment_entity_1.HomeworkAssignment)),
    __param(2, (0, typeorm_1.InjectRepository)(homework_submission_entity_1.HomeworkSubmission)),
    __param(3, (0, typeorm_1.InjectRepository)(message_thread_entity_1.MessageThread)),
    __param(4, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(5, (0, typeorm_1.InjectRepository)(attendance_session_entity_1.AttendanceSession)),
    __param(6, (0, typeorm_1.InjectRepository)(student_attendance_entity_1.StudentAttendance)),
    __param(7, (0, typeorm_1.InjectRepository)(student_enrollment_entity_1.StudentEnrollment)),
    __param(8, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __param(9, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
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
        typeorm_2.DataSource])
], TeacherService);
//# sourceMappingURL=teacher.service.js.map