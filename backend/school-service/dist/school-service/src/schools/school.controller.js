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
exports.SchoolController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const school_service_1 = require("./school.service");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
let SchoolController = class SchoolController {
    schoolService;
    constructor(schoolService) {
        this.schoolService = schoolService;
    }
    async onboardSchool(onboardDto) {
        return this.schoolService.onboardSchool(onboardDto);
    }
    async getSchools() {
        return this.schoolService.getSchools();
    }
    async getSchoolsMicroservice() {
        return this.schoolService.getSchools();
    }
    async getPeriodConfig(data) {
        return this.schoolService.getPeriodConfig(data.schoolId);
    }
    async savePeriodConfig(data) {
        return this.schoolService.savePeriodConfig(data.schoolId, data.config);
    }
};
exports.SchoolController = SchoolController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SchoolController.prototype, "onboardSchool", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_2.RbacGuard),
    (0, index_3.RequirePermissions)('system:manage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchoolController.prototype, "getSchools", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_schools' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchoolController.prototype, "getSchoolsMicroservice", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_period_config' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SchoolController.prototype, "getPeriodConfig", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'save_period_config' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SchoolController.prototype, "savePeriodConfig", null);
exports.SchoolController = SchoolController = __decorate([
    (0, common_1.Controller)('schools'),
    __metadata("design:paramtypes", [school_service_1.SchoolService])
], SchoolController);
//# sourceMappingURL=school.controller.js.map