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
exports.HomeworkController = void 0;
const common_1 = require("@nestjs/common");
const homework_service_1 = require("./homework.service");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
let HomeworkController = class HomeworkController {
    homeworkService;
    constructor(homeworkService) {
        this.homeworkService = homeworkService;
    }
    createHomework(dto) {
        return this.homeworkService.createHomework(dto);
    }
    updateHomework(id, dto) {
        return this.homeworkService.updateHomework(id, dto);
    }
    getHomeworkForClass(classId, sectionId) {
        return this.homeworkService.getHomeworkForClass(classId, sectionId);
    }
    submitHomework(dto) {
        return this.homeworkService.submitHomework(dto);
    }
    gradeHomework(dto) {
        return this.homeworkService.gradeHomework(dto.submission_id, dto.grade, dto.teacher_feedback);
    }
    getCompletionMetrics(homeworkId) {
        return this.homeworkService.getCompletionMetrics(homeworkId);
    }
};
exports.HomeworkController = HomeworkController;
__decorate([
    (0, common_1.Post)(),
    (0, index_3.RequirePermissions)('homework:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "createHomework", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, index_3.RequirePermissions)('homework:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "updateHomework", null);
__decorate([
    (0, common_1.Get)('class'),
    (0, index_3.RequirePermissions)('homework:read'),
    __param(0, (0, common_1.Query)('class_id')),
    __param(1, (0, common_1.Query)('section_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "getHomeworkForClass", null);
__decorate([
    (0, common_1.Post)('submit'),
    (0, index_3.RequirePermissions)('homework:submit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "submitHomework", null);
__decorate([
    (0, common_1.Put)('grade'),
    (0, index_3.RequirePermissions)('homework:grade'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "gradeHomework", null);
__decorate([
    (0, common_1.Get)('completion'),
    (0, index_3.RequirePermissions)('homework:read'),
    __param(0, (0, common_1.Query)('homework_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HomeworkController.prototype, "getCompletionMetrics", null);
exports.HomeworkController = HomeworkController = __decorate([
    (0, common_1.Controller)('homework'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_2.RbacGuard),
    __metadata("design:paramtypes", [homework_service_1.HomeworkService])
], HomeworkController);
//# sourceMappingURL=homework.controller.js.map