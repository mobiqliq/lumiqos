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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("../../../shared/src/entities/student.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const student_guardian_entity_1 = require("../../../shared/src/entities/student-guardian.entity");
const student_document_entity_1 = require("../../../shared/src/entities/student-document.entity");
const student_health_record_entity_1 = require("../../../shared/src/entities/student-health-record.entity");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const section_entity_1 = require("../../../shared/src/entities/section.entity");
const homework_assignment_entity_1 = require("../../../shared/src/entities/homework-assignment.entity");
const homework_submission_entity_1 = require("../../../shared/src/entities/homework-submission.entity");
let StudentsService = class StudentsService {
    studentRepo;
    enrollmentRepo;
    guardianRepo;
    documentRepo;
    healthRepo;
    yearRepo;
    classRepo;
    sectionRepo;
    questRepo;
    submissionRepo;
    constructor(studentRepo, enrollmentRepo, guardianRepo, documentRepo, healthRepo, yearRepo, classRepo, sectionRepo, questRepo, submissionRepo) {
        this.studentRepo = studentRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.guardianRepo = guardianRepo;
        this.documentRepo = documentRepo;
        this.healthRepo = healthRepo;
        this.yearRepo = yearRepo;
        this.classRepo = classRepo;
        this.sectionRepo = sectionRepo;
        this.questRepo = questRepo;
        this.submissionRepo = submissionRepo;
    }
    async createStudent(createDto) {
        const store = index_3.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const existing = await this.studentRepo.findOne({
            where: { admission_number: createDto.admission_number, school_id: schoolId }
        });
        if (existing)
            throw new common_1.BadRequestException('Admission number must be unique within the school.');
        const newStudent = this.studentRepo.create({ ...createDto, school_id: schoolId });
        return this.studentRepo.save(newStudent);
    }
    async getStudents() {
        return this.studentRepo.find();
    }
    async getStudentById(id) {
        const student = await this.studentRepo.findOne({ where: { student_id: id } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        return student;
    }
    async updateStudent(id, updateDto) {
        if (updateDto.admission_number) {
            const store = index_3.TenantContext.getStore();
            if (!store)
                throw new Error('Tenant context missing');
            const schoolId = store.schoolId;
            const existing = await this.studentRepo.findOne({
                where: { admission_number: updateDto.admission_number, school_id: schoolId }
            });
            if (existing && existing.student_id !== id) {
                throw new common_1.BadRequestException('Admission number must be unique within the school.');
            }
        }
        await this.studentRepo.update(id, updateDto);
        return this.getStudentById(id);
    }
    async deleteStudent(id) {
        const student = await this.getStudentById(id);
        await this.studentRepo.update(id, { status: index_1.StudentStatus.ARCHIVED });
        return { message: 'Student archived successfully' };
    }
    async enrollStudent(createDto) {
        const store = index_3.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const student = await this.studentRepo.findOne({ where: { student_id: createDto.student_id } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        const year = await this.yearRepo.findOne({ where: { academic_year_id: createDto.academic_year_id } });
        if (!year)
            throw new common_1.NotFoundException('Academic Year not found');
        const classEntity = await this.classRepo.findOne({ where: { class_id: createDto.class_id } });
        if (!classEntity)
            throw new common_1.NotFoundException('Class not found');
        if (createDto.section_id) {
            const sectionEntity = await this.sectionRepo.findOne({
                where: { section_id: createDto.section_id, class_id: createDto.class_id }
            });
            if (!sectionEntity)
                throw new common_1.BadRequestException('Section does not belong to the selected class');
        }
        const activeCount = await this.enrollmentRepo.count({
            where: {
                student_id: createDto.student_id,
                academic_year_id: createDto.academic_year_id,
                status: index_2.EnrollmentStatus.ACTIVE
            }
        });
        if (activeCount > 0) {
            throw new common_1.BadRequestException('Student already enrolled for this academic year');
        }
        const enrollment = this.enrollmentRepo.create({
            ...createDto,
            school_id: schoolId,
            status: index_2.EnrollmentStatus.ACTIVE
        });
        return this.enrollmentRepo.save(enrollment);
    }
    async promoteStudent(studentId, currentEnrollmentId, payload) {
        const store = index_3.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const currentEnrollment = await this.enrollmentRepo.findOne({
            where: { enrollment_id: currentEnrollmentId, student_id: studentId }
        });
        if (!currentEnrollment) {
            throw new common_1.NotFoundException('Current enrollment not found');
        }
        await this.enrollmentRepo.update(currentEnrollmentId, { status: index_2.EnrollmentStatus.COMPLETED });
        return this.enrollmentUniqueCheckAndCreate({
            student_id: studentId,
            academic_year_id: payload.target_academic_year_id,
            class_id: payload.target_class_id,
            section_id: payload.target_section_id,
            roll_number: payload.roll_number
        });
    }
    async enrollmentUniqueCheckAndCreate(dto) {
        return this.enrollStudent(dto);
    }
    async getEnrollmentsForStudent(studentId) {
        return this.enrollmentRepo.find({
            where: { student_id: studentId },
            relations: ['academic_year', 'class', 'section']
        });
    }
    async addGuardian(studentId, createDto) {
        const store = index_3.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const student = await this.getStudentById(studentId);
        const guardian = this.guardianRepo.create({
            ...createDto,
            student_id: studentId,
            school_id: schoolId
        });
        return this.guardianRepo.save(guardian);
    }
    async getGuardians(studentId) {
        return this.guardianRepo.find({ where: { student_id: studentId } });
    }
    async uploadDocument(studentId, createDto) {
        const store = index_3.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        await this.getStudentById(studentId);
        const doc = this.documentRepo.create({
            ...createDto,
            student_id: studentId,
            school_id: schoolId
        });
        return this.documentRepo.save(doc);
    }
    async getGamificationProfile(studentId) {
        const student = await this.getStudentById(studentId);
        return {
            xp: student.xp,
            level: student.level,
            streak_days: student.streak_days,
            skill_tree: student.skill_tree || { unlocked: ['basics'] }
        };
    }
    async getQuests(studentId) {
        const store = index_3.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        return this.questRepo.find({
            where: { school_id: schoolId }
        });
    }
    async submitQuest(studentId, questId, payload) {
        const student = await this.getStudentById(studentId);
        const quest = await this.questRepo.findOne({ where: { id: questId } });
        if (!quest)
            throw new common_1.NotFoundException('Quest not found');
        student.xp += quest.reward_xp || 50;
        if (student.xp >= student.level * 500) {
            student.level += 1;
        }
        await this.studentRepo.save(student);
        const submission = this.submissionRepo.create({
            homework_id: questId,
            student_id: studentId,
            status: 'submitted',
            submission_text: JSON.stringify(payload)
        });
        await this.submissionRepo.save(submission);
        return {
            message: 'Quest completed!',
            xp_gained: quest.reward_xp || 50,
            new_total_xp: student.xp,
            level_up: student.xp >= student.level * 500
        };
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(student_enrollment_entity_1.StudentEnrollment)),
    __param(2, (0, typeorm_1.InjectRepository)(student_guardian_entity_1.StudentGuardian)),
    __param(3, (0, typeorm_1.InjectRepository)(student_document_entity_1.StudentDocument)),
    __param(4, (0, typeorm_1.InjectRepository)(student_health_record_entity_1.StudentHealthRecord)),
    __param(5, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __param(6, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(7, (0, typeorm_1.InjectRepository)(section_entity_1.Section)),
    __param(8, (0, typeorm_1.InjectRepository)(homework_assignment_entity_1.HomeworkAssignment)),
    __param(9, (0, typeorm_1.InjectRepository)(homework_submission_entity_1.HomeworkSubmission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StudentsService);
//# sourceMappingURL=students.service.js.map