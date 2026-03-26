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
exports.CommandCenterController = void 0;
const common_1 = require("@nestjs/common");
const command_center_service_1 = require("./command-center.service");
const index_1 = require("../../../shared/src/index");
let CommandCenterController = class CommandCenterController {
    constructor(ccService) {
        this.ccService = ccService;
    }
    getCommandCenterSummary(req) {
        const schoolId = index_1.TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.ccService.getCommandCenterSummary(schoolId);
    }
    getEnrollmentForecast(req) {
        const schoolId = index_1.TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.ccService.getEnrollmentForecast(schoolId);
    }
    getFinancialForecast(req) {
        const schoolId = index_1.TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.ccService.getFinancialForecast(schoolId);
    }
    getTeacherWorkload(req) {
        const schoolId = index_1.TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.ccService.getTeacherWorkload(schoolId);
    }
    getStudentInterventions(req) {
        const schoolId = index_1.TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.ccService.getStudentInterventions(schoolId);
    }
    getWeeklySummary(req) {
        const schoolId = index_1.TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.ccService.getWeeklySummary(schoolId);
    }
};
exports.CommandCenterController = CommandCenterController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommandCenterController.prototype, "getCommandCenterSummary", null);
__decorate([
    (0, common_1.Get)('enrollment-forecast'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommandCenterController.prototype, "getEnrollmentForecast", null);
__decorate([
    (0, common_1.Get)('financial-forecast'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommandCenterController.prototype, "getFinancialForecast", null);
__decorate([
    (0, common_1.Get)('teacher-workload'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommandCenterController.prototype, "getTeacherWorkload", null);
__decorate([
    (0, common_1.Get)('student-interventions'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommandCenterController.prototype, "getStudentInterventions", null);
__decorate([
    (0, common_1.Get)('weekly-summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommandCenterController.prototype, "getWeeklySummary", null);
exports.CommandCenterController = CommandCenterController = __decorate([
    (0, common_1.Controller)('ai/command-center'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_1.RbacGuard),
    (0, index_1.RequireRoles)('school_owner', 'principal'),
    __metadata("design:paramtypes", [command_center_service_1.CommandCenterService])
], CommandCenterController);
//# sourceMappingURL=command-center.controller.js.map