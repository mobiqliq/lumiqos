import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeworkAssignment } from '@lumiqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@lumiqos/shared/src/entities/homework-submission.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { HomeworkStatus } from '@lumiqos/shared/index';
import { TenantContext } from '@lumiqos/shared/index';
import { EnrollmentStatus } from '@lumiqos/shared/index';

@Injectable()
export class HomeworkService {
    constructor(
        @InjectRepository(HomeworkAssignment) private readonly assignmentRepo: Repository<HomeworkAssignment>,
        @InjectRepository(HomeworkSubmission) private readonly submissionRepo: Repository<HomeworkSubmission>,
        @InjectRepository(StudentEnrollment) private readonly enrollmentRepo: Repository<StudentEnrollment>,
    ) { }

    async createHomework(dto: Partial<HomeworkAssignment>) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');

        const assignment = this.assignmentRepo.create({
            ...dto,
            school_id: store.schoolId
        });
        return this.assignmentRepo.save(assignment);
    }

    async updateHomework(id: string, dto: Partial<HomeworkAssignment>) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const assignment = await this.assignmentRepo.findOne({
            where: { homework_id: id, school_id: store.schoolId }
        });

        if (!assignment) {
            throw new NotFoundException('Homework not found');
        }

        // Check if any submissions exist
        const submissionCount = await this.submissionRepo.count({
            where: { homework_id: id, school_id: store.schoolId }
        });

        if (submissionCount > 0) {
            // Check if protected fields are being updated
            if (dto.class_id || dto.section_id || dto.subject_id) {
                throw new BadRequestException('Cannot modify class, section, or subject after students have submitted.');
            }
        }

        await this.assignmentRepo.update(id, dto);
        return this.assignmentRepo.findOne({ where: { homework_id: id, school_id: store.schoolId } });
    }

    async getHomeworkForClass(classId: string, sectionId: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');

        const whereClause: any = { school_id: store.schoolId, class_id: classId };
        if (sectionId) {
            whereClause.section_id = sectionId;
        }

        return this.assignmentRepo.find({
            where: whereClause,
            order: { due_date: 'DESC' }
        });
    }

    async submitHomework(dto: Partial<HomeworkSubmission>) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');

        const assignment = await this.assignmentRepo.findOne({
            where: { homework_id: dto.homework_id, school_id: store.schoolId }
        });

        if (!assignment) {
            throw new NotFoundException('Homework not found');
        }

        // Verify student enrollment matches assignment class/section
        // Because a student might have multiple active enrollments (though system limits to 1 per year usually),
        // we check if they have AN active enrollment for this class/section.
        const enrollment = await this.enrollmentRepo.findOne({
            where: {
                student_id: dto.student_id,
                school_id: store.schoolId,
                class_id: assignment.class_id,
                ...(assignment.section_id ? { section_id: assignment.section_id } : {}),
                status: EnrollmentStatus.ACTIVE
            }
        });

        if (!enrollment) {
            throw new BadRequestException('Student is not actively enrolled in the assigned class and section.');
        }

        // Check if already submitted and graded
        let existingSubmission = await this.submissionRepo.findOne({
            where: { homework_id: dto.homework_id, student_id: dto.student_id, school_id: store.schoolId }
        });

        if (existingSubmission && existingSubmission.status === HomeworkStatus.GRADED) {
            throw new BadRequestException('Submission already graded and locked.');
        }

        const submittedAt = new Date();
        const isLate = submittedAt > assignment.due_date;
        const status = isLate ? HomeworkStatus.LATE : HomeworkStatus.SUBMITTED;

        if (existingSubmission) {
            // Update existing submission if not graded
            await this.submissionRepo.update(existingSubmission.submission_id, {
                submission_file_url: dto.submission_file_url,
                submission_text: dto.submission_text,
                submitted_at: submittedAt,
                status: status
            });
            return this.submissionRepo.findOne({ where: { submission_id: existingSubmission.submission_id } });
        } else {
            const submission = this.submissionRepo.create({
                ...dto,
                school_id: store.schoolId,
                submitted_at: submittedAt,
                status: status
            });
            return this.submissionRepo.save(submission);
        }
    }

    async gradeHomework(submissionId: string, grade: string, feedback: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');

        const submission = await this.submissionRepo.findOne({
            where: { submission_id: submissionId, school_id: store.schoolId }
        });

        if (!submission) {
            throw new NotFoundException('Submission not found');
        }

        await this.submissionRepo.update(submissionId, {
            grade: grade,
            teacher_feedback: feedback,
            status: HomeworkStatus.GRADED
        });

        return this.submissionRepo.findOne({ where: { submission_id: submissionId } });
    }

    async getCompletionMetrics(homeworkId: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');

        const assignment = await this.assignmentRepo.findOne({
            where: { homework_id: homeworkId, school_id: store.schoolId }
        });

        if (!assignment) {
            throw new NotFoundException('Homework not found');
        }

        // Instead of fetching all enrollments, just count active ones for the class/section
        const totalStudents = await this.enrollmentRepo.count({
            where: {
                school_id: store.schoolId,
                class_id: assignment.class_id,
                ...(assignment.section_id ? { section_id: assignment.section_id } : {}),
                status: EnrollmentStatus.ACTIVE
            }
        });

        // Submissions can be submitted, late, or graded
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
}
