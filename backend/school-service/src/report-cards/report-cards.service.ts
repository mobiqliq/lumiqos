import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ReportCard } from '@xceliqos/shared/src/entities/report-card.entity';
import { ReportCardSubject } from '@xceliqos/shared/src/entities/report-card-subject.entity';
import { ExamSubject } from '@xceliqos/shared/src/entities/exam-subject.entity';
import { StudentMarks } from '@xceliqos/shared/src/entities/student-marks.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';
import { GradeScale } from '@xceliqos/shared/src/entities/grade-scale.entity';
import { TenantContext } from '@xceliqos/shared/index';
import { EnrollmentStatus } from '@xceliqos/shared/index';
import { StudentMarksStatus } from '@xceliqos/shared/index';

@Injectable()
export class ReportCardsService {
    constructor(
        @InjectRepository(ReportCard) private readonly reportCardRepo: Repository<ReportCard>,
        @InjectRepository(ReportCardSubject) private readonly reportCardSubjectRepo: Repository<ReportCardSubject>,
        @InjectRepository(ExamSubject) private readonly examSubjectRepo: Repository<ExamSubject>,
        @InjectRepository(StudentMarks) private readonly studentMarksRepo: Repository<StudentMarks>,
        @InjectRepository(StudentEnrollment) private readonly enrollmentRepo: Repository<StudentEnrollment>,
        @InjectRepository(GradeScale) private readonly gradeScaleRepo: Repository<GradeScale>
    ) { }

    async generateReportCards(examId: string, classId: string, sectionId: string | undefined, force: boolean) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        // 1. Check for existing report cards
        const existingCount = await this.reportCardRepo.count({
            where: { school_id: schoolId, exam_id: examId, class_id: classId, ...(sectionId ? { section_id: sectionId } : {}) }
        });

        if (existingCount > 0) {
            if (!force) {
                throw new BadRequestException('Report cards already generated');
            } else {
                // Force true: delete existing
                await this.reportCardRepo.delete({ school_id: schoolId, exam_id: examId, class_id: classId, ...(sectionId ? { section_id: sectionId } : {}) });
                // ReportCardSubject records should cascade delete, but if not set up properly, delete manually just in case
                // TypeORM cascade delete handles it if configured, but we explicit delete to be safe if no cascade applied on DB schema
                // Actually, wait, entity says onDelete: CASCADE on ReportCardSubject -> ReportCard. So it will be deleted.
            }
        }

        // 2. Fetch ExamSubjects
        const examSubjects = await this.examSubjectRepo.find({
            where: { school_id: schoolId, exam_id: examId, class_id: classId, ...(sectionId ? { section_id: sectionId } : {}) },
            relations: ['exam']
        });

        if (examSubjects.length === 0) {
            throw new BadRequestException('No subjects found for this exam and class configuration');
        }

        const activeYearId = examSubjects[0].exam.academic_year_id;
        const examSubjectIds = examSubjects.map(es => es.exam_subject_id);

        // 3. Check if marks exist
        const marksCount = await this.studentMarksRepo.count({
            where: { school_id: schoolId, exam_subject_id: In(examSubjectIds) }
        });

        if (marksCount === 0) {
            throw new BadRequestException('No marks available for report generation');
        }

        // 4. Fetch Enrollments
        const enrollments = await this.enrollmentRepo.find({
            where: {
                school_id: schoolId,
                class_id: classId,
                ...(sectionId ? { section_id: sectionId } : {}),
                academic_year_id: activeYearId,
                status: EnrollmentStatus.ACTIVE
            }
        });

        if (enrollments.length === 0) {
            throw new BadRequestException('No active students found in this class/section');
        }

        // 5. Fetch GradeScales
        const gradeScales = await this.gradeScaleRepo.find({ where: { school_id: schoolId } });

        // Maps
        const marksMap = new Map<string, StudentMarks[]>(); // studentId -> marks[]
        const marksData = await this.studentMarksRepo.find({
            where: { school_id: schoolId, exam_subject_id: In(examSubjectIds) }
        });

        for (const mark of marksData) {
            if (!marksMap.has(mark.student_id)) {
                marksMap.set(mark.student_id, []);
            }
            marksMap.get(mark.student_id)!.push(mark);
        }

        const reportCardsToSave: ReportCard[] = [];
        const completeReportCards: ReportCard[] = []; // Used for ranking

        await this.reportCardRepo.manager.transaction(async tx => {
            for (const enrollment of enrollments) {
                const studentId = enrollment.student_id;
                const studentMarks = marksMap.get(studentId) || [];

                let studentObtainedMarks = 0;
                let studentMaxPossibleMarks = 0;
                let missingSubjectsCount = 0;
                const rcSubjects = [];

                for (const subject of examSubjects) {
                    const mark = studentMarks.find(m => m.exam_subject_id === subject.exam_subject_id);
                    const isMissing = !mark || mark.status === StudentMarksStatus.MISSING || mark.marks_obtained === null;

                    rcSubjects.push({
                        school_id: schoolId,
                        subject_id: subject.subject_id,
                        marks_obtained: isMissing ? null : mark.marks_obtained,
                        max_marks: subject.max_marks,
                        grade: isMissing ? null : mark.grade,
                        teacher_remark: isMissing ? null : mark.remarks,
                        status: isMissing ? 'missing' : 'entered'
                    });

                    if (isMissing) {
                        missingSubjectsCount++;
                    } else {
                        studentObtainedMarks += (mark.marks_obtained ?? 0);
                        studentMaxPossibleMarks += subject.max_marks;
                    }
                }

                const percentage = studentMaxPossibleMarks > 0
                    ? (studentObtainedMarks / studentMaxPossibleMarks) * 100
                    : 0;

                const overallGrade = this.calculateGrade(percentage, gradeScales);

                const hasMarks = (studentMaxPossibleMarks > 0);

                const reportCard = tx.create(ReportCard, {
                    school_id: schoolId,
                    student_id: studentId,
                    exam_id: examId,
                    class_id: classId,
                    section_id: sectionId,
                    total_marks: hasMarks ? studentObtainedMarks : undefined,
                    percentage: hasMarks ? percentage : undefined,
                    overall_grade: hasMarks ? overallGrade : undefined,
                    rank: undefined, // Changed null to undefined for TypeORM DeepPartial
                    remarks: missingSubjectsCount > 0 ? `${missingSubjectsCount} subject(s) missing marks` : undefined
                } as any); // Type cast to avoid overload mismatch issues in this environment

                const savedReportCard = await tx.save(ReportCard, reportCard);

                // Save subjects
                const rcSubjectEntities = rcSubjects.map(sub => tx.create(ReportCardSubject, {
                    ...sub,
                    marks_obtained: sub.marks_obtained === null ? undefined : sub.marks_obtained,
                    report_card_id: savedReportCard.report_card_id
                } as any));
                await tx.save(ReportCardSubject, rcSubjectEntities);

                reportCardsToSave.push(savedReportCard);

                // Only complete students qualify for ranking
                if (missingSubjectsCount === 0 && hasMarks) {
                    completeReportCards.push(savedReportCard);
                }
            }

            // 6. Ranking Logic
            if (completeReportCards.length > 0) {
                // Sort by total marks desc
                completeReportCards.sort((a, b) => b.total_marks! - a.total_marks!);

                let actualRank = 1;
                let displayRank = 1;

                for (let i = 0; i < completeReportCards.length; i++) {
                    const rc = completeReportCards[i];
                    if (i > 0 && rc.total_marks! < completeReportCards[i - 1].total_marks!) {
                        displayRank = actualRank;
                    }
                    rc.rank = displayRank;
                    actualRank++;
                }

                await tx.save(ReportCard, completeReportCards);
            }
        });

        return {
            message: 'Report cards generated successfully',
            total_students: enrollments.length,
            ranked_students: completeReportCards.length
        };
    }

    private calculateGrade(percentage: number, scales: GradeScale[]): string | null {
        if (percentage === null || isNaN(percentage)) return null;
        for (const scale of scales) {
            if (percentage >= scale.min_marks && percentage <= scale.max_marks) {
                return scale.grade;
            }
        }
        return null;
    }

    async getClassReportCards(examId: string, classId: string, sectionId?: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        return this.reportCardRepo.find({
            where: { school_id: schoolId, exam_id: examId, class_id: classId, ...(sectionId ? { section_id: sectionId } : {}) },
            
            order: { rank: 'ASC' }
        });
    }

    async getStudentReportCards(studentId: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const reportCards = await this.reportCardRepo.find({
            where: { school_id: schoolId, student_id: studentId },
            relations: ['exam']
        });

        // Attach subjects directly for complete view
        for (const rc of reportCards) {
            const subjects = await this.reportCardSubjectRepo.find({
                where: { report_card_id: rc.report_card_id, school_id: schoolId },
                
            });
            (rc as any).subjects = subjects;
        }

        return reportCards;
    }
}
