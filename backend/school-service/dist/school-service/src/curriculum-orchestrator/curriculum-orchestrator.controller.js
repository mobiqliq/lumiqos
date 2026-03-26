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
exports.CurriculumOrchestratorController = void 0;
const common_1 = require("@nestjs/common");
const planner_service_1 = require("./services/planner.service");
const tracking_service_1 = require("./services/tracking.service");
const rescheduler_service_1 = require("./services/rescheduler.service");
const orchestrator_dto_1 = require("./dto/orchestrator.dto");
const index_1 = require("../../../shared/src/index");
const academic_planning_service_1 = require("../academic-planning/academic-planning.service");
const common_2 = require("@nestjs/common");
let CurriculumOrchestratorController = class CurriculumOrchestratorController {
    plannerService;
    trackingService;
    reschedulerService;
    academicPlanningService;
    constructor(plannerService, trackingService, reschedulerService, academicPlanningService) {
        this.plannerService = plannerService;
        this.trackingService = trackingService;
        this.reschedulerService = reschedulerService;
        this.academicPlanningService = academicPlanningService;
    }
    async generatePlan() {
        throw new common_2.HttpException('Deprecated. Use Academic Planning Engine', common_2.HttpStatus.GONE);
    }
    async getDashboardSummary(req, classId, academicYearId) {
        const schoolId = req.user?.schoolId || 'f2efb39f-304b-4841-8faf-7bda14454aac';
        const plans = await this.plannerService.getPlansForClass(schoolId, academicYearId, classId);
        const summaries = await Promise.all(plans.map(async (plan) => {
            const res = await this.academicPlanningService.getLatestPlanStatus(schoolId, academicYearId, classId, plan.subject_id);
            if (res.status !== 'APPROVED') {
                return null;
            }
            const summary = await this.trackingService.getCurriculumSummary(schoolId, academicYearId, classId, plan.subject_id);
            if (!summary)
                return null;
            return {
                ...summary,
                subject_name: plan.subject?.name || 'Unknown'
            };
        }));
        return summaries.filter((s) => s !== null);
    }
    async getPlan(req, id) {
        const schoolId = req.user?.schoolId || 'f2efb39f-304b-4841-8faf-7bda14454aac';
        return this.plannerService.getPlan(schoolId, id);
    }
    async logTeaching(req, dto) {
        const schoolId = req.user?.schoolId || 'f2efb39f-304b-4841-8faf-7bda14454aac';
        const teacherId = req.user?.id || '1dc69606-ae8e-46df-8f9d-2ee971e391a0';
        return this.trackingService.logTeaching(schoolId, teacherId, dto);
    }
    async recalculate() {
        throw new common_2.HttpException('Deprecated. Use Academic Planning Engine', common_2.HttpStatus.GONE);
    }
};
exports.CurriculumOrchestratorController = CurriculumOrchestratorController;
__decorate([
    (0, common_1.Post)('generate-plan'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CurriculumOrchestratorController.prototype, "generatePlan", null);
__decorate([
    (0, common_1.Get)('dashboard-summary'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('class_id')),
    __param(2, (0, common_1.Query)('academic_year_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CurriculumOrchestratorController.prototype, "getDashboardSummary", null);
__decorate([
    (0, common_1.Get)('plan/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CurriculumOrchestratorController.prototype, "getPlan", null);
__decorate([
    (0, common_1.Post)('log-teaching'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, orchestrator_dto_1.LogTeachingDto]),
    __metadata("design:returntype", Promise)
], CurriculumOrchestratorController.prototype, "logTeaching", null);
__decorate([
    (0, common_1.Post)('recalculate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CurriculumOrchestratorController.prototype, "recalculate", null);
exports.CurriculumOrchestratorController = CurriculumOrchestratorController = __decorate([
    (0, common_1.Controller)('curriculum-orchestrator'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard),
    __metadata("design:paramtypes", [planner_service_1.CurriculumPlannerService,
        tracking_service_1.CurriculumTrackingService,
        rescheduler_service_1.CurriculumReschedulerService,
        academic_planning_service_1.AcademicPlanningService])
], CurriculumOrchestratorController);
//# sourceMappingURL=curriculum-orchestrator.controller.js.map