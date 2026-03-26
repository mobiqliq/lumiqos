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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const attendance_session_entity_1 = require("../../../shared/src/entities/attendance-session.entity");
const student_attendance_entity_1 = require("../../../shared/src/entities/student-attendance.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
const ai_service_1 = require("../ai/ai.service");
let AttendanceService = class AttendanceService {
    sessionRepo;
    attendanceRepo;
    enrollmentRepo;
    eventEmitter;
    aiService;
    constructor(sessionRepo, attendanceRepo, enrollmentRepo, eventEmitter, aiService) {
        this.sessionRepo = sessionRepo;
        this.attendanceRepo = attendanceRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.eventEmitter = eventEmitter;
        this.aiService = aiService;
    }
    async createSession(dto) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const existingSession = await this.sessionRepo.findOne({
            where: {
                school_id: schoolId,
                class_id: dto.class_id,
                section_id: dto.section_id || undefined,
                subject_id: dto.subject_id,
                session_date: dto.session_date
            }
        });
        if (existingSession) {
            throw new common_1.BadRequestException('Session already exists for this class, subject, and date.');
        }
        const session = this.sessionRepo.create({
            ...dto,
            school_id: schoolId
        });
        const savedSession = await this.sessionRepo.save(session);
        const enrollments = await this.enrollmentRepo.find({
            where: {
                school_id: schoolId,
                class_id: dto.class_id,
                section_id: dto.section_id || undefined,
                academic_year_id: dto.academic_year_id,
                status: index_3.EnrollmentStatus.ACTIVE
            }
        });
        if (enrollments.length > 0) {
            const attendanceRecords = enrollments.map(e => ({
                school_id: schoolId,
                session_id: savedSession.session_id,
                student_id: e.student_id,
                status: index_1.AttendanceStatus.PRESENT
            }));
            await this.attendanceRepo.insert(attendanceRecords);
        }
        return {
            message: 'Session created and default attendance marked',
            session_id: savedSession.session_id,
            students_count: enrollments.length
        };
    }
    async markAttendance(sessionId, records) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const session = await this.sessionRepo.findOne({
            where: { session_id: sessionId, school_id: schoolId }
        });
        if (!session) {
            throw new common_1.NotFoundException('Attendance session not found');
        }
        const updatePromises = records.map(async (record) => {
            const result = await this.attendanceRepo.update({ session_id: sessionId, student_id: record.student_id, school_id: schoolId }, { status: record.status, remarks: record.remarks });
            if (record.status === index_1.AttendanceStatus.ABSENT) {
                this.eventEmitter.emit('student.absent', {
                    school_id: schoolId,
                    student_id: record.student_id,
                    session_id: sessionId,
                    date: session.session_date
                });
            }
            return result;
        });
        await Promise.all(updatePromises);
        return { message: 'Attendance marked successfully' };
    }
    async getClassAttendance(classId, sectionId, date) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const session = await this.sessionRepo.findOne({
            where: {
                school_id: schoolId,
                class_id: classId,
                section_id: sectionId || undefined,
                session_date: new Date(date)
            }
        });
        if (!session) {
            return [];
        }
        return this.attendanceRepo.find({
            where: { session_id: session.session_id, school_id: schoolId }
        });
    }
    async getStudentAttendance(studentId) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        return this.attendanceRepo.find({
            where: { student_id: studentId, school_id: schoolId },
            order: { created_at: 'DESC' }
        });
    }
    async getAttendanceAnalytics(teacherId, classId) {
        const mockData = {
            dailyAvg: 92,
            weeklyTrend: [88, 90, 95, 92, 94],
            mostAbsentDay: 'Tuesday'
        };
        const aiInsights = await this.aiService.generateAttendanceInsights(mockData);
        return {
            ...mockData,
            aiInsights
        };
    }
    async getSchoolOverview(schoolId) {
        return {
            todayPresence: "94%",
            monthlyAvg: "91.5%",
            criticalClasses: [
                { class: "Grade 10A", attendance: "82%", status: "low" },
                { class: "Grade 12B", attendance: "98%", status: "excellent" }
            ],
            schoolWideTrend: [90, 92, 88, 94, 95, 93, 94]
        };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_session_entity_1.AttendanceSession)),
    __param(1, (0, typeorm_1.InjectRepository)(student_attendance_entity_1.StudentAttendance)),
    __param(2, (0, typeorm_1.InjectRepository)(student_enrollment_entity_1.StudentEnrollment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2,
        ai_service_1.AiService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map