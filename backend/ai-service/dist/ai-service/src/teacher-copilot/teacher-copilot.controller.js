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
exports.TeacherCopilotController = void 0;
const common_1 = require("@nestjs/common");
const teacher_copilot_service_1 = require("./teacher-copilot.service");
const index_1 = require("../../../shared/src/index");
let TeacherCopilotController = class TeacherCopilotController {
    constructor(copilotService) {
        this.copilotService = copilotService;
    }
    async generateLessonPlan(req, body) {
        return this.copilotService.generateLessonPlan(req.user.user_id, body);
    }
    async getClassInsights(req) {
        const schoolId = index_1.TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.copilotService.getClassInsights(schoolId);
    }
    async generateHomework(req, body) {
        return this.copilotService.generateHomework(req.user.user_id, body);
    }
    async generateDifferentiatedHomework(req, body) {
        const schoolId = index_1.TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.copilotService.generateDifferentiatedHomework(req.user.user_id, schoolId, body);
    }
    async generateReportComment(req, body) {
        return this.copilotService.generateReportComment(req.user.user_id, body);
    }
    async getPTMSummary(req, studentId) {
        const schoolId = index_1.TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.copilotService.getPTMSummary(schoolId, studentId);
    }
};
exports.TeacherCopilotController = TeacherCopilotController;
__decorate([
    (0, common_1.Post)('lesson-plan'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherCopilotController.prototype, "generateLessonPlan", null);
__decorate([
    (0, common_1.Get)('class-insights'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherCopilotController.prototype, "getClassInsights", null);
__decorate([
    (0, common_1.Post)('homework-generate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherCopilotController.prototype, "generateHomework", null);
__decorate([
    (0, common_1.Post)('homework-differentiated'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherCopilotController.prototype, "generateDifferentiatedHomework", null);
__decorate([
    (0, common_1.Post)('report-comments'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherCopilotController.prototype, "generateReportComment", null);
__decorate([
    (0, common_1.Get)('ptm-summary/:student_id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherCopilotController.prototype, "getPTMSummary", null);
exports.TeacherCopilotController = TeacherCopilotController = __decorate([
    (0, common_1.Controller)('ai/teacher-copilot'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_1.RbacGuard),
    (0, index_1.RequireRoles)('teacher', 'school_admin', 'principal'),
    __metadata("design:paramtypes", [teacher_copilot_service_1.TeacherCopilotService])
], TeacherCopilotController);
//# sourceMappingURL=teacher-copilot.controller.js.map