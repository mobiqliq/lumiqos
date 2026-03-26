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
exports.CurriculumController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const curriculum_service_1 = require("./curriculum.service");
const index_1 = require("../../../shared/src/index");
let CurriculumController = class CurriculumController {
    curriculumService;
    constructor(curriculumService) {
        this.curriculumService = curriculumService;
    }
    async getSyllabus(schoolId, classId) {
        return this.curriculumService.getSyllabus(schoolId, classId);
    }
    async getCalendar(schoolId, academicYearId) {
        return this.curriculumService.getCalendar(schoolId, academicYearId);
    }
    async simulateDisruption(body) {
        return this.curriculumService.simulateDisruption(body.schoolId, body.lostDays, body.reason);
    }
    async getCalendarSummaryHttp(schoolId, month, year) {
        return this.curriculumService.getCalendarSummary(schoolId, month, parseInt(year));
    }
    async getDailyMappingHttp(schoolId, date) {
        return this.curriculumService.getDailyMapping(schoolId, date);
    }
    async getCalendarSummary(data) {
        return this.curriculumService.getCalendarSummary(data.schoolId, data.month, data.year);
    }
    async getDailyMapping(data) {
        return this.curriculumService.getDailyMapping(data.schoolId, data.date);
    }
    async generateLessonPlan(body, req) {
        const { classId, subjectId, topic } = body;
        const teacherId = req.user?.id || '1dc69606-ae8e-46df-8f9d-2ee971e391a0';
        const schoolId = req.user?.schoolId || 'f2efb39f-304b-4841-8faf-7bda14454aac';
        return this.curriculumService.generateLessonPlan(schoolId, classId, subjectId, teacherId, topic);
    }
    async generateLessonPlanTcp(data) {
        return this.curriculumService.generateLessonPlan(data.schoolId, data.classId, data.subjectId, data.teacherId, data.topic);
    }
    async getTeacherAssignments(req, tId) {
        const teacherId = req.user?.id || tId || '1dc69606-ae8e-46df-8f9d-2ee971e391a0';
        return this.curriculumService.getTeacherAssignments(teacherId);
    }
    async getSyllabusRecommendations(classId, subjectId, req) {
        const schoolId = req.user?.schoolId || 'f2efb39f-304b-4841-8faf-7bda14454aac';
        return this.curriculumService.getSyllabusRecommendations(schoolId, classId, subjectId);
    }
    async executeLesson(id, body) {
        return this.curriculumService.executeLesson(id, body.topic, body.lessonPlanId);
    }
    async getParentInsights(studentId) {
        return this.curriculumService.getParentInsights(studentId);
    }
    async generateAcademicPlan(req) {
        const schoolId = req.user?.schoolId || 'f2efb39f-304b-4841-8faf-7bda14454aac';
        return this.curriculumService.generateAcademicPlan(schoolId);
    }
};
exports.CurriculumController = CurriculumController;
__decorate([
    (0, common_1.Get)('syllabus/:schoolId/:classId'),
    __param(0, (0, common_1.Param)('schoolId')),
    __param(1, (0, common_1.Param)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "getSyllabus", null);
__decorate([
    (0, common_1.Get)('calendar/:schoolId/:academicYearId'),
    __param(0, (0, common_1.Param)('schoolId')),
    __param(1, (0, common_1.Param)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "getCalendar", null);
__decorate([
    (0, common_1.Post)('calendar/simulate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "simulateDisruption", null);
__decorate([
    (0, common_1.Get)('calendar-summary'),
    __param(0, (0, common_1.Query)('schoolId')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "getCalendarSummaryHttp", null);
__decorate([
    (0, common_1.Get)('daily-drilldown'),
    __param(0, (0, common_1.Query)('schoolId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "getDailyMappingHttp", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_calendar_summary' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "getCalendarSummary", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_daily_mapping' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "getDailyMapping", null);
__decorate([
    (0, common_1.Post)('generate-lesson-plan'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "generateLessonPlan", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'generate_lesson_plan' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "generateLessonPlanTcp", null);
__decorate([
    (0, common_1.Get)('teacher/assignments'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "getTeacherAssignments", null);
__decorate([
    (0, common_1.Get)('syllabus/recommendations/:classId/:subjectId'),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Param)('subjectId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "getSyllabusRecommendations", null);
__decorate([
    (0, common_1.Post)('execute/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "executeLesson", null);
__decorate([
    (0, common_1.Get)('parent/insights/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "getParentInsights", null);
__decorate([
    (0, common_1.Post)('generate-academic-plan'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "generateAcademicPlan", null);
exports.CurriculumController = CurriculumController = __decorate([
    (0, common_1.Controller)('curriculum'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard),
    __metadata("design:paramtypes", [curriculum_service_1.CurriculumService])
], CurriculumController);
//# sourceMappingURL=curriculum.controller.js.map