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
exports.AcademicPlanningController = void 0;
const common_1 = require("@nestjs/common");
const academic_planning_service_1 = require("./academic-planning.service");
const generate_plan_dto_1 = require("./dto/generate-plan.dto");
const approve_plan_dto_1 = require("./dto/approve-plan.dto");
let AcademicPlanningController = class AcademicPlanningController {
    planningService;
    constructor(planningService) {
        this.planningService = planningService;
    }
    async generatePlan(dto) {
        return this.planningService.generatePlan(dto.school_id, dto.academic_year_id, dto.class_id, dto.subject_id, dto.disruption_mode);
    }
    async approvePlan(dto) {
        return this.planningService.approvePlan(dto.plan_id);
    }
    async getPlanStatus(schoolId, academicYearId, classId, subjectId) {
        return this.planningService.getLatestPlanStatus(schoolId, academicYearId, classId, subjectId);
    }
    async getAcademicHealthSummary(schoolId, academicYearId) {
        return this.planningService.getAcademicHealthSummary(schoolId, academicYearId);
    }
    async getDailyInsights(schoolId, academicYearId) {
        return this.planningService.getDailyInsights(schoolId, academicYearId);
    }
    async getPlanPreview(planId) {
        return this.planningService.getPlanPreview(planId);
    }
    async updatePlanItems(planId, updates) {
        return this.planningService.updatePlanItems(planId, updates);
    }
    async getPlan(planId) {
        return this.planningService.getPlan(planId);
    }
};
exports.AcademicPlanningController = AcademicPlanningController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_plan_dto_1.GeneratePlanDto]),
    __metadata("design:returntype", Promise)
], AcademicPlanningController.prototype, "generatePlan", null);
__decorate([
    (0, common_1.Post)('approve'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [approve_plan_dto_1.ApprovePlanDto]),
    __metadata("design:returntype", Promise)
], AcademicPlanningController.prototype, "approvePlan", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Query)('school_id')),
    __param(1, (0, common_1.Query)('academic_year_id')),
    __param(2, (0, common_1.Query)('class_id')),
    __param(3, (0, common_1.Query)('subject_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AcademicPlanningController.prototype, "getPlanStatus", null);
__decorate([
    (0, common_1.Get)('health-summary'),
    __param(0, (0, common_1.Query)('school_id')),
    __param(1, (0, common_1.Query)('academic_year_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicPlanningController.prototype, "getAcademicHealthSummary", null);
__decorate([
    (0, common_1.Get)('daily-insights'),
    __param(0, (0, common_1.Query)('school_id')),
    __param(1, (0, common_1.Query)('academic_year_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicPlanningController.prototype, "getDailyInsights", null);
__decorate([
    (0, common_1.Get)('preview/:plan_id'),
    __param(0, (0, common_1.Param)('plan_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicPlanningController.prototype, "getPlanPreview", null);
__decorate([
    (0, common_1.Post)(':plan_id/update-items'),
    __param(0, (0, common_1.Param)('plan_id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], AcademicPlanningController.prototype, "updatePlanItems", null);
__decorate([
    (0, common_1.Get)(':plan_id'),
    __param(0, (0, common_1.Param)('plan_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicPlanningController.prototype, "getPlan", null);
exports.AcademicPlanningController = AcademicPlanningController = __decorate([
    (0, common_1.Controller)('academic-planning'),
    __metadata("design:paramtypes", [academic_planning_service_1.AcademicPlanningService])
], AcademicPlanningController);
//# sourceMappingURL=academic-planning.controller.js.map