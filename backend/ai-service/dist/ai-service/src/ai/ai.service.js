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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../shared/src/index");
let AiService = class AiService {
    constructor(studentRepo, enrollmentRepo, attendanceRepo, hwRepo, rcRepo, rcSubjectRepo, yrRepo) {
        this.studentRepo = studentRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.attendanceRepo = attendanceRepo;
        this.hwRepo = hwRepo;
        this.rcRepo = rcRepo;
        this.rcSubjectRepo = rcSubjectRepo;
        this.yrRepo = yrRepo;
    }
    async getActiveYear(schoolId) {
        const year = await this.yrRepo.findOne({ where: { school_id: schoolId, status: 'active' } });
        if (!year)
            throw new common_1.InternalServerErrorException('No active academic year');
        return year.academic_year_id;
    }
    wrapAiResponse(analysis, confidence = 0.95) {
        return {
            analysis,
            confidence_score: confidence,
            generated_at: new Date().toISOString(),
            generated_by: "ai-service"
        };
    }
    async getStudentPerformance(studentId) {
        const schoolId = index_1.TenantContext.getStore().schoolId;
        const yearId = await this.getActiveYear(schoolId);
        const rcs = await this.rcRepo.find({
            where: { school_id: schoolId, student_id: studentId },
            order: { generated_at: 'DESC' },
            take: 6
        });
        let trend = 'stable';
        if (rcs.length >= 2) {
            const recent = rcs.slice(0, Math.floor(rcs.length / 2));
            const past = rcs.slice(Math.floor(rcs.length / 2));
            const recentAvg = recent.reduce((sum, r) => sum + Number(r.percentage), 0) / recent.length;
            const pastAvg = past.reduce((sum, r) => sum + Number(r.percentage), 0) / past.length;
            if (recentAvg > pastAvg + 5)
                trend = 'improving';
            else if (recentAvg < pastAvg - 5)
                trend = 'declining';
        }
        const [attCount, attPresent] = await Promise.all([
            this.attendanceRepo.count({ where: { student_id: studentId, school_id: schoolId } }),
            this.attendanceRepo.count({ where: { student_id: studentId, school_id: schoolId, status: 'present' } })
        ]);
        const attRatio = attCount > 0 ? (attPresent / attCount) * 100 : 100;
        let riskLevel = 'low';
        if (attRatio < 75 && trend === 'declining')
            riskLevel = 'high';
        else if (attRatio < 85 || trend === 'declining')
            riskLevel = 'medium';
        return this.wrapAiResponse({
            student_id: studentId,
            performance_trend: trend,
            risk_level: riskLevel,
            recommended_actions: riskLevel === 'high' ? ['Schedule parent meeting', 'Increase homework completion'] : ['Monitor progress']
        }, 0.88);
    }
    async getClassAnalytics(classId, sectionId) {
        const schoolId = index_1.TenantContext.getStore().schoolId;
        const yearId = await this.getActiveYear(schoolId);
        const cards = await this.rcRepo.createQueryBuilder('rc')
            .where('rc.school_id = :schoolId', { schoolId })
            .andWhere('rc.class_id = :classId', { classId })
            .andWhere('rc.section_id = :sectionId', { sectionId })
            .limit(5000)
            .getMany();
        const classAvg = cards.length > 0 ? cards.reduce((sum, c) => sum + Number(c.percentage), 0) / cards.length : 0;
        return this.wrapAiResponse({
            class_average_score: classAvg.toFixed(2),
            attendance_trend: "stable",
            most_struggling_topics: ["Fractions", "Algebraic Expressions"],
            recommended_interventions: ["Schedule remedial maths session"]
        }, 0.91);
    }
    async getRiskStudents() {
        const schoolId = index_1.TenantContext.getStore().schoolId;
        const yearId = await this.getActiveYear(schoolId);
        const enrollments = await this.enrollmentRepo.find({
            where: { school_id: schoolId, academic_year_id: yearId, status: 'active' },
            take: 2000
        });
        const riskStudents = [];
        for (const enr of enrollments.slice(0, 50)) {
            let signals = 0;
            let reason = [];
            const atts = await this.attendanceRepo.find({ where: { student_id: enr.student_id, school_id: schoolId } });
            if (atts.length > 0) {
                const attP = (atts.filter(a => a.status === 'present').length / atts.length) * 100;
                if (attP < 75) {
                    signals++;
                    reason.push('attendance < 75%');
                }
            }
            const hws = await this.hwRepo.find({ where: { student_id: enr.student_id, school_id: schoolId } });
            if (hws.length > 0) {
                const hwP = (hws.filter(h => h.status === 'submitted' || h.status === 'graded').length / hws.length) * 100;
                if (hwP < 60) {
                    signals++;
                    reason.push('homework completion < 60%');
                }
            }
            if (signals > 0) {
                riskStudents.push({
                    student_id: enr.student_id,
                    risk_level: signals === 3 ? 'high risk' : (signals === 2 ? 'medium risk' : 'low risk'),
                    risk_reason: reason.join(', '),
                    recommended_intervention: `Counseling required touching ${signals} trigger points.`
                });
            }
        }
        return this.wrapAiResponse(riskStudents, 0.94);
    }
    async generateCurriculum(payload) {
        return this.wrapAiResponse({
            weekly_learning_plan: [
                { week: 1, topic: "Introduction to Core Concepts" },
                { week: 2, topic: "Advanced Applications" }
            ],
            learning_objectives: ["Master theoretical bounds", "Apply real-world logic"],
            assessment_points: ["End-of-week quizzes", "Monthly practical test"]
        }, 0.98);
    }
    async generateAssessment(payload) {
        return this.wrapAiResponse({
            mcqs: [
                { question: "What is 2+2?", options: ["3", "4", "5"], answer: "4" }
            ],
            short_answer_questions: ["Explain gravity."],
            long_answer_questions: ["Detail the solar system formation."]
        }, 0.92);
    }
    async evaluateHomework(payload) {
        return this.wrapAiResponse({
            suggested_grade: "B+",
            feedback_summary: "Good effort mapping logic, but missed edge case definitions.",
            learning_gaps: ["Exception handling", "Boundary condition checks"]
        }, 0.85);
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(index_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(index_1.StudentEnrollment)),
    __param(2, (0, typeorm_1.InjectRepository)(index_1.StudentAttendance)),
    __param(3, (0, typeorm_1.InjectRepository)(index_1.HomeworkSubmission)),
    __param(4, (0, typeorm_1.InjectRepository)(index_1.ReportCard)),
    __param(5, (0, typeorm_1.InjectRepository)(index_1.ReportCardSubject)),
    __param(6, (0, typeorm_1.InjectRepository)(index_1.AcademicYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AiService);
//# sourceMappingURL=ai.service.js.map