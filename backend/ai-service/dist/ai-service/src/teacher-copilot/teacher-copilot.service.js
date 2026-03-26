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
exports.TeacherCopilotService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../shared/src/index");
let TeacherCopilotService = class TeacherCopilotService {
    constructor(profileRepo, yrRepo) {
        this.profileRepo = profileRepo;
        this.yrRepo = yrRepo;
        this.lessonCache = new Map();
        this.TTL_24H = 24 * 60 * 60 * 1000;
        this.rateLimits = new Map();
    }
    async getActiveYear(schoolId) {
        const yr = await this.yrRepo.findOne({ where: { school_id: schoolId, status: 'active' } });
        if (!yr)
            throw new common_1.InternalServerErrorException("No active academic year found.");
        return yr.academic_year_id;
    }
    checkRateLimit(teacherId, type) {
        const today = new Date().toISOString().split('T')[0];
        let limits = this.rateLimits.get(teacherId) || { day: today, lessonCount: 0, hwCount: 0, reportCount: 0 };
        if (limits.day !== today) {
            limits = { day: today, lessonCount: 0, hwCount: 0, reportCount: 0 };
        }
        if (type === 'lesson' && limits.lessonCount >= 20)
            throw new common_1.HttpException('Lesson plan limit reached', common_1.HttpStatus.TOO_MANY_REQUESTS);
        if (type === 'hw' && limits.hwCount >= 30)
            throw new common_1.HttpException('Homework limit reached', common_1.HttpStatus.TOO_MANY_REQUESTS);
        if (type === 'report' && limits.reportCount >= 100)
            throw new common_1.HttpException('Report limit reached', common_1.HttpStatus.TOO_MANY_REQUESTS);
        if (type === 'lesson')
            limits.lessonCount++;
        if (type === 'hw')
            limits.hwCount++;
        if (type === 'report')
            limits.reportCount++;
        this.rateLimits.set(teacherId, limits);
    }
    async generateLessonPlan(teacherId, payload) {
        this.checkRateLimit(teacherId, 'lesson');
        const { subject, grade_level, topic, board, duration_minutes, learning_objective_level } = payload;
        const cacheKey = ;
        `lesson_plan:\${subject}:\${grade_level}:\${topic}:\${learning_objective_level}\`;
        if (this.lessonCache.has(cacheKey) && this.lessonCache.get(cacheKey)!.expiresAt > Date.now()) {
            return this.lessonCache.get(cacheKey)!.data;
        }

        const data = LessonPlanner.generateMockLessonPlan(subject, topic, duration_minutes, learning_objective_level || 'conceptual');
        this.lessonCache.set(cacheKey, { data, expiresAt: Date.now() + this.TTL_24H });
        return data;
    }

    async getClassInsights(schoolId: string) {
        // Scans ALL global profiles organically securely bypassing live schema reads elegantly.
        const yearId = await this.getActiveYear(schoolId);
        const profiles = await this.profileRepo.find({ where: { school_id: schoolId, academic_year_id: yearId } });
        return ClassroomInsights.analyze(profiles);
    }

    async generateHomework(teacherId: string, payload: any) {
        this.checkRateLimit(teacherId, 'hw');
        const { subject, grade_level, topic, difficulty, question_count } = payload;
        return HomeworkGenerator.generateHomework(subject, topic, question_count || 5, difficulty || 'standard');
    }

    async generateDifferentiatedHomework(teacherId: string, schoolId: string, payload: any) {
        this.checkRateLimit(teacherId, 'hw');
        const { subject, topic } = payload;
        const yearId = await this.getActiveYear(schoolId);
        const profiles = await this.profileRepo.find({ where: { school_id: schoolId, academic_year_id: yearId } });
        
        return HomeworkGenerator.generateDifferentiatedHomework(subject, topic, profiles);
    }

    async generateReportComment(teacherId: string, payload: any) {
        this.checkRateLimit(teacherId, 'report');
        const { student_id, subject, performance_level } = payload;
        return {
             student_id,
             subject,
             comment: ReportCommentGenerator.generateComment(performance_level, subject)
        };
    }

    async getPTMSummary(schoolId: string, studentId: string) {
        const yearId = await this.getActiveYear(schoolId);
        const profile = await this.profileRepo.findOne({ where: { school_id: schoolId, student_id: studentId, academic_year_id: yearId } });
        return ReportCommentGenerator.generatePTMSummary(profile as StudentLearningProfile);
    }
}
        ;
    }
};
exports.TeacherCopilotService = TeacherCopilotService;
exports.TeacherCopilotService = TeacherCopilotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(index_1.StudentLearningProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(index_1.AcademicYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TeacherCopilotService);
//# sourceMappingURL=teacher-copilot.service.js.map