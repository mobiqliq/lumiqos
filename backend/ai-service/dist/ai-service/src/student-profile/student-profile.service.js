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
exports.StudentProfileService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../shared/src/index");
const student_profile_analyzer_1 = require("./student-profile.analyzer");
let StudentProfileService = class StudentProfileService {
    constructor(profileRepo, enrollmentRepo, attRepo, hwRepo, rcRepo, rcsRepo, yrRepo, subjectRepo, classRepo) {
        this.profileRepo = profileRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.attRepo = attRepo;
        this.hwRepo = hwRepo;
        this.rcRepo = rcRepo;
        this.rcsRepo = rcsRepo;
        this.yrRepo = yrRepo;
        this.subjectRepo = subjectRepo;
        this.classRepo = classRepo;
    }
    async getActiveYear(schoolId) {
        const yr = await this.yrRepo.findOne({ where: { school_id: schoolId, status: 'active' } });
        if (!yr)
            throw new common_1.InternalServerErrorException("No active academic year natively available.");
        return yr.academic_year_id;
    }
    async triggerBatchRebuild(schoolId) {
        const yearId = await this.getActiveYear(schoolId);
        let skip = 0;
        const limit = 100;
        let processed = 0;
        while (true) {
            const enrollments = await this.enrollmentRepo.find({
                where: { school_id: schoolId, academic_year_id: yearId, status: 'active' },
                skip,
                take: limit
            });
            if (enrollments.length === 0)
                break;
            for (const enr of enrollments) {
                await this.rebuildStudentProfile(schoolId, enr.student_id, yearId);
                processed++;
            }
            skip += limit;
        }
        return { status: 'success', profiles_processed: processed };
    }
    async rebuildStudentProfile(schoolId, studentId, yearId) {
        const [totalAtt, presentAtt] = await Promise.all([
            this.attRepo.count({ where: { school_id: schoolId, student_id: studentId } }),
            this.attRepo.count({ where: { school_id: schoolId, student_id: studentId, status: 'present' } })
        ]);
        const [totalHw, submittedHw] = await Promise.all([
            this.hwRepo.count({ where: { school_id: schoolId, student_id: studentId } }),
            this.hwRepo.count({ where: { school_id: schoolId, student_id: studentId, status: 'submitted' } })
        ]);
        const recentExams = await this.rcRepo.find({
            where: { school_id: schoolId, student_id: studentId, academic_year_id: yearId },
            order: { generated_at: 'DESC' },
            take: 50
        });
        const examScores = recentExams.map(r => Number(r.percentage));
        let studentAvg = 0;
        let classAvgFallback = 75;
        if (examScores.length > 0) {
            studentAvg = examScores.reduce((a, b) => a + b, 0) / examScores.length;
        }
        const subjectRecords = await this.rcsRepo.find({
            where: { school_id: schoolId, student_id: studentId },
            take: 200
        });
        const subjectMapping = new Map();
        const mappedSubjects = [];
        for (const sub of subjectRecords) {
            let name = subjectMapping.get(sub.subject_id);
            if (!name) {
                const sObj = await this.subjectRepo.findOne({ where: { subject_id: sub.subject_id } });
                name = sObj?.subject_name || 'Unknown';
                subjectMapping.set(sub.subject_id, name);
            }
            mappedSubjects.push({ subject: name, studentScore: Number(sub.marks_secured), classAvg: Number(sub.highest_marks) * 0.75 });
        }
        const attIndex = student_profile_analyzer_1.StudentProfileAnalyzer.calculateAttendanceIndex(presentAtt, totalAtt);
        const hwIndex = student_profile_analyzer_1.StudentProfileAnalyzer.calculateHomeworkIndex(submittedHw, totalHw);
        const examIndex = student_profile_analyzer_1.StudentProfileAnalyzer.calculateExamIndex(studentAvg, classAvgFallback);
        let recentAvg = examScores.length > 0 ? examScores[0] : 0;
        let prevAvg = examScores.length > 1 ? examScores[1] : recentAvg;
        let examDrop = prevAvg - recentAvg;
        const { strengths, weaknesses } = student_profile_analyzer_1.StudentProfileAnalyzer.detectStrengthsAndWeaknesses(mappedSubjects);
        const consistency = student_profile_analyzer_1.StudentProfileAnalyzer.calculateConsistencyScore(examScores.slice(0, 5));
        const engagement = student_profile_analyzer_1.StudentProfileAnalyzer.calculateEngagementScore(attIndex, hwIndex);
        const trend = student_profile_analyzer_1.StudentProfileAnalyzer.calculateGrowthTrend(recentAvg, prevAvg);
        const attPerc = totalAtt > 0 ? (presentAtt / totalAtt) * 100 : 100;
        const hwPerc = totalHw > 0 ? (submittedHw / totalHw) * 100 : 100;
        const { risk_index, risk_signals } = student_profile_analyzer_1.StudentProfileAnalyzer.calculateRiskIndex(attPerc, hwPerc, examDrop);
        let profile = await this.profileRepo.findOne({
            where: { school_id: schoolId, student_id: studentId, academic_year_id: yearId }
        });
        if (!profile) {
            profile = this.profileRepo.create({
                school_id: schoolId, student_id: studentId, academic_year_id: yearId
            });
        }
        profile.learning_velocity = recentAvg > 0 ? recentAvg / 100 : 0;
        profile.engagement_score = engagement;
        profile.consistency_score = consistency;
        profile.attendance_index = attIndex;
        profile.homework_completion_index = hwIndex;
        profile.exam_performance_index = examIndex;
        profile.subject_strengths = strengths;
        profile.subject_weaknesses = weaknesses;
        profile.risk_index = risk_index;
        profile.risk_signals = risk_signals;
        profile.growth_trend = trend;
        profile.data_points_used = totalAtt + totalHw + subjectRecords.length;
        profile.analysis_version = 'v1.1';
        await this.profileRepo.save(profile);
    }
    async getTeacherProfile(schoolId, studentId) {
        const yearId = await this.getActiveYear(schoolId);
        const profile = await this.profileRepo.findOne({ where: { school_id: schoolId, student_id: studentId, academic_year_id: yearId } });
        if (!profile)
            return { error: "Profile not yet generated." };
        return {
            learning_velocity: Number(profile.learning_velocity),
            engagement_score: Number(profile.engagement_score),
            consistency_score: Number(profile.consistency_score),
            subject_strengths: profile.subject_strengths,
            subject_weaknesses: profile.subject_weaknesses,
            risk_index: profile.risk_index,
            risk_signals: profile.risk_signals,
            growth_trend: profile.growth_trend,
            profile_last_updated: profile.profile_last_updated
        };
    }
    async getParentInsights(schoolId, studentId) {
        const yearId = await this.getActiveYear(schoolId);
        const profile = await this.profileRepo.findOne({ where: { school_id: schoolId, student_id: studentId, academic_year_id: yearId } });
        if (!profile)
            return { error: "Profile not yet generated." };
        return {
            growth_trend: profile.growth_trend,
            strengths: profile.subject_strengths,
            improvement_areas: profile.subject_weaknesses,
            engagement_score: Number(profile.engagement_score),
            last_updated: profile.profile_last_updated
        };
    }
};
exports.StudentProfileService = StudentProfileService;
exports.StudentProfileService = StudentProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(index_1.StudentLearningProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(index_1.StudentEnrollment)),
    __param(2, (0, typeorm_1.InjectRepository)(index_1.StudentAttendance)),
    __param(3, (0, typeorm_1.InjectRepository)(index_1.HomeworkSubmission)),
    __param(4, (0, typeorm_1.InjectRepository)(index_1.ReportCard)),
    __param(5, (0, typeorm_1.InjectRepository)(index_1.ReportCardSubject)),
    __param(6, (0, typeorm_1.InjectRepository)(index_1.AcademicYear)),
    __param(7, (0, typeorm_1.InjectRepository)(index_1.Subject)),
    __param(8, (0, typeorm_1.InjectRepository)(index_1.Class)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StudentProfileService);
//# sourceMappingURL=student-profile.service.js.map