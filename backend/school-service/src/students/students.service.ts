import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '@lumiqos/shared/src/entities/student.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { StudentGuardian } from '@lumiqos/shared/src/entities/student-guardian.entity';
import { StudentDocument } from '@lumiqos/shared/src/entities/student-document.entity';
import { StudentHealthRecord } from '@lumiqos/shared/src/entities/student-health-record.entity';
import { StudentStatus } from '@lumiqos/shared/index';
import { EnrollmentStatus } from '@lumiqos/shared/index';
import { TenantContext } from '@lumiqos/shared/index';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Section } from '@lumiqos/shared/src/entities/section.entity';
import { HomeworkAssignment } from '@lumiqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@lumiqos/shared/src/entities/homework-submission.entity';

@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
        @InjectRepository(StudentEnrollment) private readonly enrollmentRepo: Repository<StudentEnrollment>,
        @InjectRepository(StudentGuardian) private readonly guardianRepo: Repository<StudentGuardian>,
        @InjectRepository(StudentDocument) private readonly documentRepo: Repository<StudentDocument>,
        @InjectRepository(StudentHealthRecord) private readonly healthRepo: Repository<StudentHealthRecord>,
        @InjectRepository(AcademicYear) private readonly yearRepo: Repository<AcademicYear>,
        @InjectRepository(Class) private readonly classRepo: Repository<Class>,
        @InjectRepository(Section) private readonly sectionRepo: Repository<Section>,
        @InjectRepository(HomeworkAssignment) private readonly questRepo: Repository<HomeworkAssignment>,
        @InjectRepository(HomeworkSubmission) private readonly submissionRepo: Repository<HomeworkSubmission>,
    ) { }

    // --- Student CRUD ---
    async createStudent(createDto: Partial<Student>) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        // Check if admission number exists for this school
        const existing = await this.studentRepo.findOne({
            where: { admission_number: createDto.admission_number, school_id: schoolId }
        });
        if (existing) throw new BadRequestException('Admission number must be unique within the school.');

        const newStudent = this.studentRepo.create({ ...createDto, school_id: schoolId });
        return this.studentRepo.save(newStudent);
    }

    async getStudents() {
        return this.studentRepo.find();
    }

    async getStudentById(id: string) {
        const student = await this.studentRepo.findOne({ where: { student_id: id } });
        if (!student) throw new NotFoundException('Student not found');
        return student;
    }

    async updateStudent(id: string, updateDto: Partial<Student>) {
        // Unique check if changing admission number
        if (updateDto.admission_number) {
            const store = TenantContext.getStore();
            if (!store) throw new Error('Tenant context missing');
            const schoolId = store.schoolId;
            const existing = await this.studentRepo.findOne({
                where: { admission_number: updateDto.admission_number, school_id: schoolId }
            });
            if (existing && existing.student_id !== id) {
                throw new BadRequestException('Admission number must be unique within the school.');
            }
        }
        await this.studentRepo.update(id, updateDto);
        return this.getStudentById(id);
    }

    async deleteStudent(id: string) {
        // Soft delete
        const student = await this.getStudentById(id);
        await this.studentRepo.update(id, { status: StudentStatus.ARCHIVED });
        return { message: 'Student archived successfully' };
    }

    // --- Enrollment Logic ---
    async enrollStudent(createDto: Partial<StudentEnrollment>) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        // Verify target entities
        const student = await this.studentRepo.findOne({ where: { student_id: createDto.student_id } });
        if (!student) throw new NotFoundException('Student not found');

        const year = await this.yearRepo.findOne({ where: { academic_year_id: createDto.academic_year_id } });
        if (!year) throw new NotFoundException('Academic Year not found');

        const classEntity = await this.classRepo.findOne({ where: { class_id: createDto.class_id } });
        if (!classEntity) throw new NotFoundException('Class not found');

        if (createDto.section_id) {
            const sectionEntity = await this.sectionRepo.findOne({
                where: { section_id: createDto.section_id, class_id: createDto.class_id }
            });
            if (!sectionEntity) throw new BadRequestException('Section does not belong to the selected class');
        }

        // Constraint: Only ONE active enrollment per academic year
        const activeCount = await this.enrollmentRepo.count({
            where: {
                student_id: createDto.student_id,
                academic_year_id: createDto.academic_year_id,
                status: EnrollmentStatus.ACTIVE
            }
        });

        if (activeCount > 0) {
            throw new BadRequestException('Student already enrolled for this academic year');
        }

        const enrollment = this.enrollmentRepo.create({
            ...createDto,
            school_id: schoolId,
            status: EnrollmentStatus.ACTIVE
        });

        return this.enrollmentRepo.save(enrollment);
    }

    async promoteStudent(studentId: string, currentEnrollmentId: string, payload: { target_academic_year_id: string, target_class_id: string, target_section_id?: string, roll_number?: string }) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        // We keep local schoolId if needed, but here it's implicit in delegated calls.

        const currentEnrollment = await this.enrollmentRepo.findOne({
            where: { enrollment_id: currentEnrollmentId, student_id: studentId }
        });

        if (!currentEnrollment) {
            throw new NotFoundException('Current enrollment not found');
        }

        // 1. Mark current as completed
        await this.enrollmentRepo.update(currentEnrollmentId, { status: EnrollmentStatus.COMPLETED });

        // 2. Delegate to enroll logic for mapping creating the new record safely
        // (enrollStudent handles existence validations, duplication checks naturally).
        return this.enrollmentUniqueCheckAndCreate({
            student_id: studentId,
            academic_year_id: payload.target_academic_year_id,
            class_id: payload.target_class_id,
            section_id: payload.target_section_id,
            roll_number: payload.roll_number
        });
    }

    // internal wrapper 
    private async enrollmentUniqueCheckAndCreate(dto: Partial<StudentEnrollment>) {
        return this.enrollStudent(dto);
    }

    async getEnrollmentsForStudent(studentId: string) {
        return this.enrollmentRepo.find({
            where: { student_id: studentId },
            relations: ['academic_year', 'class', 'section']
        });
    }

    // --- Guardians ---
    async addGuardian(studentId: string, createDto: Partial<StudentGuardian>) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        // Verify student ownership
        const student = await this.getStudentById(studentId);

        const guardian = this.guardianRepo.create({
            ...createDto,
            student_id: studentId,
            school_id: schoolId
        });
        return this.guardianRepo.save(guardian);
    }

    async getGuardians(studentId: string) {
        return this.guardianRepo.find({ where: { student_id: studentId } });
    }

    // --- Documents ---
    async uploadDocument(studentId: string, createDto: Partial<StudentDocument>) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        await this.getStudentById(studentId); // trigger 404 naturally

        const doc = this.documentRepo.create({
            ...createDto,
            student_id: studentId,
            school_id: schoolId
        });
        return this.documentRepo.save(doc);
    }

    // --- Gamification (Student Universe) ---
    async getGamificationProfile(studentId: string) {
        const student = await this.getStudentById(studentId);
        return {
            xp: student.xp,
            level: student.level,
            streak_days: student.streak_days,
            skill_tree: student.skill_tree || { unlocked: ['basics'] }
        };
    }

    async getQuests(studentId: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        // Fetch active assignments for this student's enrollments that are of type 'quest' or 'homework'
        // Simplified query for demo purposes:
        return this.questRepo.find({
            where: { school_id: schoolId } // Normally we filter by class/section
        });
    }

    async submitQuest(studentId: string, questId: string, payload: any) {
        const student = await this.getStudentById(studentId);
        const quest = await this.questRepo.findOne({ where: { id: questId } });

        if (!quest) throw new NotFoundException('Quest not found');

        // Award XP
        student.xp += quest.reward_xp || 50;

        // Level up logic (every 500 XP = 1 level)
        if (student.xp >= student.level * 500) {
            student.level += 1;
        }

        await this.studentRepo.save(student);

        // Record submission
        const submission = this.submissionRepo.create({
            homework_id: questId,
            student_id: studentId,
            status: 'submitted',
            submission_text: JSON.stringify(payload) // Can hold JSON for exit tickets
        });

        await this.submissionRepo.save(submission);

        return {
            message: 'Quest completed!',
            xp_gained: quest.reward_xp || 50,
            new_total_xp: student.xp,
            level_up: student.xp >= student.level * 500
        };
    }
}
