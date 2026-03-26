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
exports.ReportCardsController = void 0;
const common_1 = require("@nestjs/common");
const report_cards_service_1 = require("./report-cards.service");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
let ReportCardsController = class ReportCardsController {
    reportCardsService;
    constructor(reportCardsService) {
        this.reportCardsService = reportCardsService;
    }
    generateReportCards(dto) {
        if (!dto.exam_id || !dto.class_id) {
            throw new common_1.BadRequestException('exam_id and class_id are required');
        }
        return this.reportCardsService.generateReportCards(dto.exam_id, dto.class_id, dto.section_id, !!dto.force);
    }
    getClassReportCards(examId, classId, sectionId) {
        if (!examId || !classId) {
            throw new common_1.BadRequestException('exam_id and class_id are required');
        }
        return this.reportCardsService.getClassReportCards(examId, classId, sectionId);
    }
    getStudentReportCards(studentId) {
        return this.reportCardsService.getStudentReportCards(studentId);
    }
};
exports.ReportCardsController = ReportCardsController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, index_3.RequirePermissions)('reports:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportCardsController.prototype, "generateReportCards", null);
__decorate([
    (0, common_1.Get)('class'),
    (0, index_3.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Query)('exam_id')),
    __param(1, (0, common_1.Query)('class_id')),
    __param(2, (0, common_1.Query)('section_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportCardsController.prototype, "getClassReportCards", null);
__decorate([
    (0, common_1.Get)('student/:student_id'),
    (0, index_3.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportCardsController.prototype, "getStudentReportCards", null);
exports.ReportCardsController = ReportCardsController = __decorate([
    (0, common_1.Controller)('report-cards'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_2.RbacGuard),
    __metadata("design:paramtypes", [report_cards_service_1.ReportCardsService])
], ReportCardsController);
//# sourceMappingURL=report-cards.controller.js.map