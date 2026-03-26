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
exports.ExamsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const exam_type_entity_1 = require("../../../shared/src/entities/exam-type.entity");
const exam_entity_1 = require("../../../shared/src/entities/exam.entity");
const exam_subject_entity_1 = require("../../../shared/src/entities/exam-subject.entity");
const student_marks_entity_1 = require("../../../shared/src/entities/student-marks.entity");
const grade_scale_entity_1 = require("../../../shared/src/entities/grade-scale.entity");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const index_3 = require("../../../shared/src/index");
const index_4 = require("../../../shared/src/index");
const ai_service_1 = require("../ai/ai.service");
let ExamsService = class ExamsService {
    examTypeRepo;
    examRepo;
    examSubjectRepo;
    studentMarksRepo;
    gradeScaleRepo;
    enrollmentRepo;
    aiService;
    constructor(examTypeRepo, examRepo, examSubjectRepo, studentMarksRepo, gradeScaleRepo, enrollmentRepo, aiService) {
        this.examTypeRepo = examTypeRepo;
        this.examRepo = examRepo;
        this.examSubjectRepo = examSubjectRepo;
        this.studentMarksRepo = studentMarksRepo;
        this.gradeScaleRepo = gradeScaleRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.aiService = aiService;
    }
    async createExamType(dto) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const type = this.examTypeRepo.create({ ...dto, school_id: store.schoolId });
        return this.examTypeRepo.save(type);
    }
    async getExamTypes() {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        return this.examTypeRepo.find({ where: { school_id: store.schoolId } });
    }
    async createExam(dto) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const exam = this.examRepo.create({ ...dto, school_id: store.schoolId });
        return this.examRepo.save(exam);
    }
    async getExams() {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        return this.examRepo.find({
            where: { school_id: store.schoolId },
            relations: ['exam_type', 'academic_year']
        });
    }
    async assignSubject(dto) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const exam = await this.examRepo.findOne({
            where: { exam_id: dto.exam_id, school_id: store.schoolId }
        });
        if (!exam)
            throw new common_1.NotFoundException('Exam not found');
        const subject = this.examSubjectRepo.create({ ...dto, school_id: store.schoolId });
        return this.examSubjectRepo.save(subject);
    }
    async createGradeScale(dto) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const existingScales = await this.gradeScaleRepo.find({
            where: { school_id: store.schoolId }
        });
        for (const scale of existingScales) {
            if (dto.min_marks !== undefined && dto.max_marks !== undefined) {
                if (dto.min_marks <= scale.max_marks && dto.max_marks >= scale.min_marks) {
                    throw new common_1.BadRequestException('Grade scale ranges overlap with existing scale: ' + scale.grade);
                }
            }
        }
        const scale = this.gradeScaleRepo.create({ ...dto, school_id: store.schoolId });
        return this.gradeScaleRepo.save(scale);
    }
    calculateGrade(marks, scales) {
        if (marks === null)
            return null;
        for (const scale of scales) {
            if (marks >= scale.min_marks && marks <= scale.max_marks) {
                return scale.grade;
            }
        }
        return null;
    }
    async enterBulkMarks(examSubjectId, records) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const examSubject = await this.examSubjectRepo.findOne({
            where: { exam_subject_id: examSubjectId, school_id: schoolId },
            relations: ['exam']
        });
        if (!examSubject) {
            throw new common_1.NotFoundException('Exam subject not found');
        }
        if (examSubject.exam.status === index_1.ExamStatus.PUBLISHED) {
            throw new common_1.BadRequestException('Marks locked after exam publication');
        }
        const gradeScales = await this.gradeScaleRepo.find({
            where: { school_id: schoolId }
        });
        const activeYearId = examSubject.exam.academic_year_id;
        const results = [];
        await this.studentMarksRepo.manager.transaction(async (transactionalEntityManager) => {
            for (const record of records) {
                if (record.marks_obtained !== null) {
                    if (record.marks_obtained < 0) {
                        throw new common_1.BadRequestException(`Marks cannot be negative for student ${record.student_id}`);
                    }
                    if (record.marks_obtained > examSubject.max_marks) {
                        throw new common_1.BadRequestException(`Marks cannot exceed ${examSubject.max_marks} for student ${record.student_id}`);
                    }
                }
                const enrollment = await transactionalEntityManager.findOne(student_enrollment_entity_1.StudentEnrollment, {
                    where: {
                        student_id: record.student_id,
                        school_id: schoolId,
                        class_id: examSubject.class_id,
                        ...(examSubject.section_id ? { section_id: examSubject.section_id } : {}),
                        academic_year_id: activeYearId,
                        status: index_3.EnrollmentStatus.ACTIVE
                    }
                });
                if (!enrollment) {
                    throw new common_1.BadRequestException(`Student ${record.student_id} is not actively enrolled in the assigned class and section.`);
                }
                const calculatedGrade = this.calculateGrade(record.marks_obtained, gradeScales);
                const markStatus = record.marks_obtained === null ? index_4.StudentMarksStatus.MISSING : index_4.StudentMarksStatus.ENTERED;
                let existingMark = await transactionalEntityManager.findOne(student_marks_entity_1.StudentMarks, {
                    where: { exam_subject_id: examSubjectId, student_id: record.student_id, school_id: schoolId }
                });
                if (existingMark) {
                    existingMark.marks_obtained = record.marks_obtained;
                    existingMark.grade = calculatedGrade;
                    existingMark.remarks = record.remarks || existingMark.remarks;
                    existingMark.status = markStatus;
                    await transactionalEntityManager.save(existingMark);
                    results.push(existingMark);
                }
                else {
                    const newMark = transactionalEntityManager.create(student_marks_entity_1.StudentMarks, {
                        school_id: schoolId,
                        exam_subject_id: examSubjectId,
                        student_id: record.student_id,
                        marks_obtained: record.marks_obtained,
                        grade: calculatedGrade,
                        remarks: record.remarks,
                        status: markStatus
                    });
                    await transactionalEntityManager.save(student_marks_entity_1.StudentMarks, newMark);
                    results.push(newMark);
                }
            }
        });
        return { message: 'Marks updated successfully', count: results.length };
    }
    async getResults(examId, classId, sectionId) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const whereClause = { exam_id: examId, class_id: classId, school_id: store.schoolId };
        if (sectionId) {
            whereClause.section_id = sectionId;
        }
        const subjects = await this.examSubjectRepo.find({ where: whereClause });
        const subjectIds = subjects.map(s => s.exam_subject_id);
        if (subjectIds.length === 0)
            return [];
        return this.studentMarksRepo.createQueryBuilder('marks')
            .innerJoinAndSelect('marks.exam_subject', 'exam_subject')
            .innerJoinAndSelect('exam_subject.subject', 'subject')
            .innerJoinAndSelect('marks.student', 'student')
            .where('marks.school_id = :schoolId', { schoolId: store.schoolId })
            .andWhere('marks.exam_subject_id IN (:...subjectIds)', { subjectIds })
            .getMany();
    }
    async getStudentHistory(studentId) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        return this.studentMarksRepo.find({
            where: { student_id: studentId, school_id: store.schoolId },
            relations: ['exam_subject', 'exam_subject.exam', 'exam_subject.subject'],
            order: { created_at: 'DESC' }
        });
    }
    async generateExam(board, subject, classLevel, type) {
        return this.aiService.generateExam(board, subject, classLevel, type);
    }
};
exports.ExamsService = ExamsService;
exports.ExamsService = ExamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(exam_type_entity_1.ExamType)),
    __param(1, (0, typeorm_1.InjectRepository)(exam_entity_1.Exam)),
    __param(2, (0, typeorm_1.InjectRepository)(exam_subject_entity_1.ExamSubject)),
    __param(3, (0, typeorm_1.InjectRepository)(student_marks_entity_1.StudentMarks)),
    __param(4, (0, typeorm_1.InjectRepository)(grade_scale_entity_1.GradeScale)),
    __param(5, (0, typeorm_1.InjectRepository)(student_enrollment_entity_1.StudentEnrollment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ai_service_1.AiService])
], ExamsService);
//# sourceMappingURL=exams.service.js.map