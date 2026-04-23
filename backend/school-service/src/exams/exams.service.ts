import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamType } from '@xceliqos/shared/src/entities/exam-type.entity';
import { Exam } from '@xceliqos/shared/src/entities/exam.entity';
import { ExamSubject } from '@xceliqos/shared/src/entities/exam-subject.entity';
import { StudentMarks } from '@xceliqos/shared/src/entities/student-marks.entity';
import { GradeScale } from '@xceliqos/shared/src/entities/grade-scale.entity';
import { ExamStatus } from '@xceliqos/shared/index';
import { TenantContext } from '@xceliqos/shared/index';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';
import { EnrollmentStatus } from '@xceliqos/shared/index';
import { StudentMarksStatus } from '@xceliqos/shared/index';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ExamsService {
    constructor(
        @InjectRepository(ExamType) private readonly examTypeRepo: Repository<ExamType>,
        @InjectRepository(Exam) private readonly examRepo: Repository<Exam>,
        @InjectRepository(ExamSubject) private readonly examSubjectRepo: Repository<ExamSubject>,
        @InjectRepository(StudentMarks) private readonly studentMarksRepo: Repository<StudentMarks>,
        @InjectRepository(GradeScale) private readonly gradeScaleRepo: Repository<GradeScale>,
        @InjectRepository(StudentEnrollment) private readonly enrollmentRepo: Repository<StudentEnrollment>,
        private aiService: AiService,
    ) { }

    async createExamType(dto: Partial<ExamType>) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const type = this.examTypeRepo.create({ ...dto, school_id: store.schoolId });
        return this.examTypeRepo.save(type);
    }

    async getExamTypes() {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        return this.examTypeRepo.find({ where: { school_id: store.schoolId } });
    }

    async createExam(dto: Partial<Exam>) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const exam = this.examRepo.create({ ...dto, school_id: store.schoolId });
        return this.examRepo.save(exam);
    }

    async getExams() {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        return this.examRepo.find({
            where: { school_id: store.schoolId },
            
        });
    }

    async assignSubject(dto: Partial<ExamSubject>) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');

        // Ensure the exam exists
        const exam = await this.examRepo.findOne({
            where: { exam_id: dto.exam_id, school_id: store.schoolId }
        });
        if (!exam) throw new NotFoundException('Exam not found');

        const subject = this.examSubjectRepo.create({ ...dto, school_id: store.schoolId });
        return this.examSubjectRepo.save(subject);
    }

    async createGradeScale(dto: Partial<GradeScale>) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');

        // Check for overlaps
        const existingScales = await this.gradeScaleRepo.find({
            where: { school_id: store.schoolId }
        });

        for (const scale of existingScales) {
            // Overlap check
            if (dto.min_marks !== undefined && dto.max_marks !== undefined) {
                if (dto.min_marks <= scale.max_marks && dto.max_marks >= scale.min_marks) {
                    throw new BadRequestException('Grade scale ranges overlap with existing scale: ' + scale.grade);
                }
            }
        }

        const scale = this.gradeScaleRepo.create({ ...dto, school_id: store.schoolId });
        return this.gradeScaleRepo.save(scale);
    }

    private calculateGrade(marks: number | null, scales: GradeScale[]): string | null {
        if (marks === null) return null;
        for (const scale of scales) {
            if (marks >= scale.min_marks && marks <= scale.max_marks) {
                return scale.grade;
            }
        }
        return null;
    }

    async enterBulkMarks(examSubjectId: string, records: { student_id: string; marks_obtained: number | null; remarks?: string }[]) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        // Verify ExamSubject exists and get details
        const examSubject = await this.examSubjectRepo.findOne({
            where: { exam_subject_id: examSubjectId, school_id: schoolId },
            relations: ['exam']
        });

        if (!examSubject) {
            throw new NotFoundException('Exam subject not found');
        }

        // Verify Exam is not published
        if (examSubject.exam.status === ExamStatus.PUBLISHED) {
            throw new BadRequestException('Marks locked after exam publication');
        }

        // Pre-fetch all GradeScales for auto calculation
        const gradeScales = await this.gradeScaleRepo.find({
            where: { school_id: schoolId }
        });

        const activeYearId = examSubject.exam.academic_year_id;

        const results = [];

        // Optimize: we use a single transaction for batch behavior
        await this.studentMarksRepo.manager.transaction(async transactionalEntityManager => {
            for (const record of records) {
                // Bounds checking
                if (record.marks_obtained !== null) {
                    if (record.marks_obtained < 0) {
                        throw new BadRequestException(`Marks cannot be negative for student ${record.student_id}`);
                    }
                    if (record.marks_obtained > examSubject.max_marks) {
                        throw new BadRequestException(`Marks cannot exceed ${examSubject.max_marks} for student ${record.student_id}`);
                    }
                }

                // Verify enrollment
                const enrollment = await transactionalEntityManager.findOne(StudentEnrollment, {
                    where: {
                        student_id: record.student_id,
                        school_id: schoolId,
                        class_id: examSubject.class_id,
                        ...(examSubject.section_id ? { section_id: examSubject.section_id } : {}),
                        academic_year_id: activeYearId,
                        status: EnrollmentStatus.ACTIVE
                    }
                });

                if (!enrollment) {
                    throw new BadRequestException(`Student ${record.student_id} is not actively enrolled in the assigned class and section.`);
                }

                const calculatedGrade = this.calculateGrade(record.marks_obtained, gradeScales);
                const markStatus = record.marks_obtained === null ? StudentMarksStatus.MISSING : StudentMarksStatus.ENTERED;

                let existingMark = await transactionalEntityManager.findOne(StudentMarks, {
                    where: { exam_subject_id: examSubjectId, student_id: record.student_id, school_id: schoolId }
                });

                if (existingMark) {
                    existingMark.marks_obtained = record.marks_obtained;
                    existingMark.grade = calculatedGrade;
                    existingMark.remarks = record.remarks || existingMark.remarks;
                    existingMark.status = markStatus;
                    await transactionalEntityManager.save(existingMark);
                    results.push(existingMark);
                } else {
                    const newMark = transactionalEntityManager.create(StudentMarks, {
                        school_id: schoolId,
                        exam_subject_id: examSubjectId,
                        student_id: record.student_id,
                        marks_obtained: record.marks_obtained as number, // Cast to handle null if DB allows but TS is strict here
                        grade: calculatedGrade as string,
                        remarks: record.remarks,
                        status: markStatus
                    });
                    await transactionalEntityManager.save(StudentMarks, newMark);
                    results.push(newMark);
                }
            }
        });

        return { message: 'Marks updated successfully', count: results.length };
    }

    async getResults(examId: string, classId: string, sectionId?: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');

        // Find all subjects for this exam/class combination
        const whereClause: any = { exam_id: examId, class_id: classId, school_id: store.schoolId };
        if (sectionId) {
            whereClause.section_id = sectionId;
        }

        const subjects = await this.examSubjectRepo.find({ where: whereClause });
        const subjectIds = subjects.map(s => s.exam_subject_id);

        if (subjectIds.length === 0) return [];

        // Fetch marks for these subjects using In() block
        return this.studentMarksRepo.createQueryBuilder('marks')
            
            .where('marks.school_id = :schoolId', { schoolId: store.schoolId })
            .andWhere('marks.exam_subject_id IN (:...subjectIds)', { subjectIds })
            .getMany();
    }

    async getStudentHistory(studentId: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');

        return this.studentMarksRepo.find({
            where: { student_id: studentId, school_id: store.schoolId },
            
            order: { created_at: 'DESC' }
        });
    }

    // --- AI Exam Generation ---
    async generateExam(board: string, subject: string, classLevel: string, type: string) {
        return this.aiService.generateExam(board, subject, classLevel, type);
    }
}
