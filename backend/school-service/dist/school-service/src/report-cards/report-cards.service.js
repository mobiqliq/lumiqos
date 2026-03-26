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
exports.ReportCardsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_card_entity_1 = require("../../../shared/src/entities/report-card.entity");
const report_card_subject_entity_1 = require("../../../shared/src/entities/report-card-subject.entity");
const exam_subject_entity_1 = require("../../../shared/src/entities/exam-subject.entity");
const student_marks_entity_1 = require("../../../shared/src/entities/student-marks.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const grade_scale_entity_1 = require("../../../shared/src/entities/grade-scale.entity");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
let ReportCardsService = class ReportCardsService {
    reportCardRepo;
    reportCardSubjectRepo;
    examSubjectRepo;
    studentMarksRepo;
    enrollmentRepo;
    gradeScaleRepo;
    constructor(reportCardRepo, reportCardSubjectRepo, examSubjectRepo, studentMarksRepo, enrollmentRepo, gradeScaleRepo) {
        this.reportCardRepo = reportCardRepo;
        this.reportCardSubjectRepo = reportCardSubjectRepo;
        this.examSubjectRepo = examSubjectRepo;
        this.studentMarksRepo = studentMarksRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.gradeScaleRepo = gradeScaleRepo;
    }
    async generateReportCards(examId, classId, sectionId, force) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const existingCount = await this.reportCardRepo.count({
            where: { school_id: schoolId, exam_id: examId, class_id: classId, ...(sectionId ? { section_id: sectionId } : {}) }
        });
        if (existingCount > 0) {
            if (!force) {
                throw new common_1.BadRequestException('Report cards already generated');
            }
            else {
                await this.reportCardRepo.delete({ school_id: schoolId, exam_id: examId, class_id: classId, ...(sectionId ? { section_id: sectionId } : {}) });
            }
        }
        const examSubjects = await this.examSubjectRepo.find({
            where: { school_id: schoolId, exam_id: examId, class_id: classId, ...(sectionId ? { section_id: sectionId } : {}) },
            relations: ['exam']
        });
        if (examSubjects.length === 0) {
            throw new common_1.BadRequestException('No subjects found for this exam and class configuration');
        }
        const activeYearId = examSubjects[0].exam.academic_year_id;
        const examSubjectIds = examSubjects.map(es => es.exam_subject_id);
        const marksCount = await this.studentMarksRepo.count({
            where: { school_id: schoolId, exam_subject_id: (0, typeorm_2.In)(examSubjectIds) }
        });
        if (marksCount === 0) {
            throw new common_1.BadRequestException('No marks available for report generation');
        }
        const enrollments = await this.enrollmentRepo.find({
            where: {
                school_id: schoolId,
                class_id: classId,
                ...(sectionId ? { section_id: sectionId } : {}),
                academic_year_id: activeYearId,
                status: index_2.EnrollmentStatus.ACTIVE
            }
        });
        if (enrollments.length === 0) {
            throw new common_1.BadRequestException('No active students found in this class/section');
        }
        const gradeScales = await this.gradeScaleRepo.find({ where: { school_id: schoolId } });
        const marksMap = new Map();
        const marksData = await this.studentMarksRepo.find({
            where: { school_id: schoolId, exam_subject_id: (0, typeorm_2.In)(examSubjectIds) }
        });
        for (const mark of marksData) {
            if (!marksMap.has(mark.student_id)) {
                marksMap.set(mark.student_id, []);
            }
            marksMap.get(mark.student_id).push(mark);
        }
        const reportCardsToSave = [];
        const completeReportCards = [];
        await this.reportCardRepo.manager.transaction(async (tx) => {
            for (const enrollment of enrollments) {
                const studentId = enrollment.student_id;
                const studentMarks = marksMap.get(studentId) || [];
                let studentObtainedMarks = 0;
                let studentMaxPossibleMarks = 0;
                let missingSubjectsCount = 0;
                const rcSubjects = [];
                for (const subject of examSubjects) {
                    const mark = studentMarks.find(m => m.exam_subject_id === subject.exam_subject_id);
                    const isMissing = !mark || mark.status === index_3.StudentMarksStatus.MISSING || mark.marks_obtained === null;
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
                    }
                    else {
                        studentObtainedMarks += (mark.marks_obtained ?? 0);
                        studentMaxPossibleMarks += subject.max_marks;
                    }
                }
                const percentage = studentMaxPossibleMarks > 0
                    ? (studentObtainedMarks / studentMaxPossibleMarks) * 100
                    : 0;
                const overallGrade = this.calculateGrade(percentage, gradeScales);
                const hasMarks = (studentMaxPossibleMarks > 0);
                const reportCard = tx.create(report_card_entity_1.ReportCard, {
                    school_id: schoolId,
                    student_id: studentId,
                    exam_id: examId,
                    class_id: classId,
                    section_id: sectionId,
                    total_marks: hasMarks ? studentObtainedMarks : undefined,
                    percentage: hasMarks ? percentage : undefined,
                    overall_grade: hasMarks ? overallGrade : undefined,
                    rank: undefined,
                    remarks: missingSubjectsCount > 0 ? `${missingSubjectsCount} subject(s) missing marks` : undefined
                });
                const savedReportCard = await tx.save(report_card_entity_1.ReportCard, reportCard);
                const rcSubjectEntities = rcSubjects.map(sub => tx.create(report_card_subject_entity_1.ReportCardSubject, {
                    ...sub,
                    marks_obtained: sub.marks_obtained === null ? undefined : sub.marks_obtained,
                    report_card_id: savedReportCard.report_card_id
                }));
                await tx.save(report_card_subject_entity_1.ReportCardSubject, rcSubjectEntities);
                reportCardsToSave.push(savedReportCard);
                if (missingSubjectsCount === 0 && hasMarks) {
                    completeReportCards.push(savedReportCard);
                }
            }
            if (completeReportCards.length > 0) {
                completeReportCards.sort((a, b) => b.total_marks - a.total_marks);
                let actualRank = 1;
                let displayRank = 1;
                for (let i = 0; i < completeReportCards.length; i++) {
                    const rc = completeReportCards[i];
                    if (i > 0 && rc.total_marks < completeReportCards[i - 1].total_marks) {
                        displayRank = actualRank;
                    }
                    rc.rank = displayRank;
                    actualRank++;
                }
                await tx.save(report_card_entity_1.ReportCard, completeReportCards);
            }
        });
        return {
            message: 'Report cards generated successfully',
            total_students: enrollments.length,
            ranked_students: completeReportCards.length
        };
    }
    calculateGrade(percentage, scales) {
        if (percentage === null || isNaN(percentage))
            return null;
        for (const scale of scales) {
            if (percentage >= scale.min_marks && percentage <= scale.max_marks) {
                return scale.grade;
            }
        }
        return null;
    }
    async getClassReportCards(examId, classId, sectionId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        return this.reportCardRepo.find({
            where: { school_id: schoolId, exam_id: examId, class_id: classId, ...(sectionId ? { section_id: sectionId } : {}) },
            relations: ['student'],
            order: { rank: 'ASC' }
        });
    }
    async getStudentReportCards(studentId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const reportCards = await this.reportCardRepo.find({
            where: { school_id: schoolId, student_id: studentId },
            relations: ['exam', 'exam.exam_type']
        });
        for (const rc of reportCards) {
            const subjects = await this.reportCardSubjectRepo.find({
                where: { report_card_id: rc.report_card_id, school_id: schoolId },
                relations: ['subject']
            });
            rc.subjects = subjects;
        }
        return reportCards;
    }
};
exports.ReportCardsService = ReportCardsService;
exports.ReportCardsService = ReportCardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_card_entity_1.ReportCard)),
    __param(1, (0, typeorm_1.InjectRepository)(report_card_subject_entity_1.ReportCardSubject)),
    __param(2, (0, typeorm_1.InjectRepository)(exam_subject_entity_1.ExamSubject)),
    __param(3, (0, typeorm_1.InjectRepository)(student_marks_entity_1.StudentMarks)),
    __param(4, (0, typeorm_1.InjectRepository)(student_enrollment_entity_1.StudentEnrollment)),
    __param(5, (0, typeorm_1.InjectRepository)(grade_scale_entity_1.GradeScale)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportCardsService);
//# sourceMappingURL=report-cards.service.js.map