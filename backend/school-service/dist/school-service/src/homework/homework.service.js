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
exports.HomeworkService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const homework_assignment_entity_1 = require("../../../shared/src/entities/homework-assignment.entity");
const homework_submission_entity_1 = require("../../../shared/src/entities/homework-submission.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
let HomeworkService = class HomeworkService {
    assignmentRepo;
    submissionRepo;
    enrollmentRepo;
    constructor(assignmentRepo, submissionRepo, enrollmentRepo) {
        this.assignmentRepo = assignmentRepo;
        this.submissionRepo = submissionRepo;
        this.enrollmentRepo = enrollmentRepo;
    }
    async createHomework(dto) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const assignment = this.assignmentRepo.create({
            ...dto,
            school_id: store.schoolId
        });
        return this.assignmentRepo.save(assignment);
    }
    async updateHomework(id, dto) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const assignment = await this.assignmentRepo.findOne({
            where: { homework_id: id, school_id: store.schoolId }
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Homework not found');
        }
        const submissionCount = await this.submissionRepo.count({
            where: { homework_id: id, school_id: store.schoolId }
        });
        if (submissionCount > 0) {
            if (dto.class_id || dto.section_id || dto.subject_id) {
                throw new common_1.BadRequestException('Cannot modify class, section, or subject after students have submitted.');
            }
        }
        await this.assignmentRepo.update(id, dto);
        return this.assignmentRepo.findOne({ where: { homework_id: id, school_id: store.schoolId } });
    }
    async getHomeworkForClass(classId, sectionId) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const whereClause = { school_id: store.schoolId, class_id: classId };
        if (sectionId) {
            whereClause.section_id = sectionId;
        }
        return this.assignmentRepo.find({
            where: whereClause,
            order: { due_date: 'DESC' }
        });
    }
    async submitHomework(dto) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const assignment = await this.assignmentRepo.findOne({
            where: { homework_id: dto.homework_id, school_id: store.schoolId }
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Homework not found');
        }
        const enrollment = await this.enrollmentRepo.findOne({
            where: {
                student_id: dto.student_id,
                school_id: store.schoolId,
                class_id: assignment.class_id,
                ...(assignment.section_id ? { section_id: assignment.section_id } : {}),
                status: index_3.EnrollmentStatus.ACTIVE
            }
        });
        if (!enrollment) {
            throw new common_1.BadRequestException('Student is not actively enrolled in the assigned class and section.');
        }
        let existingSubmission = await this.submissionRepo.findOne({
            where: { homework_id: dto.homework_id, student_id: dto.student_id, school_id: store.schoolId }
        });
        if (existingSubmission && existingSubmission.status === index_1.HomeworkStatus.GRADED) {
            throw new common_1.BadRequestException('Submission already graded and locked.');
        }
        const submittedAt = new Date();
        const isLate = submittedAt > assignment.due_date;
        const status = isLate ? index_1.HomeworkStatus.LATE : index_1.HomeworkStatus.SUBMITTED;
        if (existingSubmission) {
            await this.submissionRepo.update(existingSubmission.submission_id, {
                submission_file_url: dto.submission_file_url,
                submission_text: dto.submission_text,
                submitted_at: submittedAt,
                status: status
            });
            return this.submissionRepo.findOne({ where: { submission_id: existingSubmission.submission_id } });
        }
        else {
            const submission = this.submissionRepo.create({
                ...dto,
                school_id: store.schoolId,
                submitted_at: submittedAt,
                status: status
            });
            return this.submissionRepo.save(submission);
        }
    }
    async gradeHomework(submissionId, grade, feedback) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const submission = await this.submissionRepo.findOne({
            where: { submission_id: submissionId, school_id: store.schoolId }
        });
        if (!submission) {
            throw new common_1.NotFoundException('Submission not found');
        }
        await this.submissionRepo.update(submissionId, {
            grade: grade,
            teacher_feedback: feedback,
            status: index_1.HomeworkStatus.GRADED
        });
        return this.submissionRepo.findOne({ where: { submission_id: submissionId } });
    }
    async getCompletionMetrics(homeworkId) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const assignment = await this.assignmentRepo.findOne({
            where: { homework_id: homeworkId, school_id: store.schoolId }
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Homework not found');
        }
        const totalStudents = await this.enrollmentRepo.count({
            where: {
                school_id: store.schoolId,
                class_id: assignment.class_id,
                ...(assignment.section_id ? { section_id: assignment.section_id } : {}),
                status: index_3.EnrollmentStatus.ACTIVE
            }
        });
        const submissions = await this.submissionRepo.count({
            where: {
                homework_id: homeworkId,
                school_id: store.schoolId
            }
        });
        const missing = Math.max(0, totalStudents - submissions);
        const completionPercentage = totalStudents > 0 ? (submissions / totalStudents) * 100 : 0;
        return {
            total_students: totalStudents,
            submitted: submissions,
            missing: missing,
            completion_percentage: Number(completionPercentage.toFixed(2))
        };
    }
};
exports.HomeworkService = HomeworkService;
exports.HomeworkService = HomeworkService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(homework_assignment_entity_1.HomeworkAssignment)),
    __param(1, (0, typeorm_1.InjectRepository)(homework_submission_entity_1.HomeworkSubmission)),
    __param(2, (0, typeorm_1.InjectRepository)(student_enrollment_entity_1.StudentEnrollment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], HomeworkService);
//# sourceMappingURL=homework.service.js.map