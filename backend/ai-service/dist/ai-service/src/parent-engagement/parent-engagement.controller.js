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
exports.ParentEngagementController = void 0;
const common_1 = require("@nestjs/common");
const parent_engagement_service_1 = require("./parent-engagement.service");
const index_1 = require("../../../shared/src/index");
let ParentEngagementController = class ParentEngagementController {
    constructor(engagementService) {
        this.engagementService = engagementService;
    }
    async getDailyDigest(req, studentId) {
        const schoolId = index_1.TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.engagementService.generateDailyDigest(req.user.user_id, schoolId, studentId);
    }
    async getLearningTimeline(req, studentId) {
        const schoolId = index_1.TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.engagementService.getLearningTimeline(req.user.user_id, schoolId, studentId);
    }
    async getFeeInsight(req, studentId) {
        const schoolId = index_1.TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.engagementService.getFeeInsight(req.user.user_id, schoolId, studentId);
    }
    async getPtmPrep(req, studentId) {
        const schoolId = index_1.TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.engagementService.getPtmPrep(req.user.user_id, schoolId, studentId);
    }
    async getLearningRecommendations(req, studentId) {
        const schoolId = index_1.TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.engagementService.getLearningRecommendations(req.user.user_id, schoolId, studentId);
    }
    async triggerWeeklyReport() {
        return this.engagementService.triggerWeeklyReport();
    }
};
exports.ParentEngagementController = ParentEngagementController;
__decorate([
    (0, common_1.Get)('daily-digest/:student_id'),
    (0, index_1.RequireRoles)('parent'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentEngagementController.prototype, "getDailyDigest", null);
__decorate([
    (0, common_1.Get)('learning-timeline/:student_id'),
    (0, index_1.RequireRoles)('parent'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentEngagementController.prototype, "getLearningTimeline", null);
__decorate([
    (0, common_1.Get)('fee-insight/:student_id'),
    (0, index_1.RequireRoles)('parent'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentEngagementController.prototype, "getFeeInsight", null);
__decorate([
    (0, common_1.Get)('ptm-prep/:student_id'),
    (0, index_1.RequireRoles)('parent'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentEngagementController.prototype, "getPtmPrep", null);
__decorate([
    (0, common_1.Get)('learning-recommendations/:student_id'),
    (0, index_1.RequireRoles)('parent'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentEngagementController.prototype, "getLearningRecommendations", null);
__decorate([
    (0, common_1.Post)('weekly-report'),
    (0, index_1.RequireRoles)('school_admin', 'school_owner', 'principal'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ParentEngagementController.prototype, "triggerWeeklyReport", null);
exports.ParentEngagementController = ParentEngagementController = __decorate([
    (0, common_1.Controller)('ai/parent'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_1.RbacGuard),
    __metadata("design:paramtypes", [parent_engagement_service_1.ParentEngagementService])
], ParentEngagementController);
//# sourceMappingURL=parent-engagement.controller.js.map