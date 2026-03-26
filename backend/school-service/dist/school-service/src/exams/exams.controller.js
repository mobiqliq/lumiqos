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
exports.ExamsController = void 0;
const common_1 = require("@nestjs/common");
const exams_service_1 = require("./exams.service");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
let ExamsController = class ExamsController {
    examsService;
    constructor(examsService) {
        this.examsService = examsService;
    }
    createExamType(dto) {
        return this.examsService.createExamType(dto);
    }
    getExamTypes() {
        return this.examsService.getExamTypes();
    }
    createExam(dto) {
        return this.examsService.createExam(dto);
    }
    getExams() {
        return this.examsService.getExams();
    }
    assignSubject(dto) {
        return this.examsService.assignSubject(dto);
    }
    enterBulkMarks(dto) {
        if (!dto.exam_subject_id || !Array.isArray(dto.records)) {
            throw new common_1.BadRequestException('Invalid payload. Expected exam_subject_id and an array of records.');
        }
        return this.examsService.enterBulkMarks(dto.exam_subject_id, dto.records);
    }
    getResults(examId, classId, sectionId) {
        return this.examsService.getResults(examId, classId, sectionId);
    }
    getStudentHistory(studentId) {
        return this.examsService.getStudentHistory(studentId);
    }
    createGradeScale(dto) {
        return this.examsService.createGradeScale(dto);
    }
    generateExam(dto) {
        return this.examsService.generateExam(dto.board, dto.subject, dto.classLevel, dto.type);
    }
};
exports.ExamsController = ExamsController;
__decorate([
    (0, common_1.Post)('types'),
    (0, index_3.RequirePermissions)('exams:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExamsController.prototype, "createExamType", null);
__decorate([
    (0, common_1.Get)('types'),
    (0, index_3.RequirePermissions)('exams:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExamsController.prototype, "getExamTypes", null);
__decorate([
    (0, common_1.Post)(),
    (0, index_3.RequirePermissions)('exams:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExamsController.prototype, "createExam", null);
__decorate([
    (0, common_1.Get)(),
    (0, index_3.RequirePermissions)('exams:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExamsController.prototype, "getExams", null);
__decorate([
    (0, common_1.Post)('subjects'),
    (0, index_3.RequirePermissions)('exams:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExamsController.prototype, "assignSubject", null);
__decorate([
    (0, common_1.Post)('marks'),
    (0, index_3.RequirePermissions)('marks:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExamsController.prototype, "enterBulkMarks", null);
__decorate([
    (0, common_1.Get)('results'),
    (0, index_3.RequirePermissions)('exams:read'),
    __param(0, (0, common_1.Query)('exam_id')),
    __param(1, (0, common_1.Query)('class_id')),
    __param(2, (0, common_1.Query)('section_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ExamsController.prototype, "getResults", null);
__decorate([
    (0, common_1.Get)('student/:student_id'),
    (0, index_3.RequirePermissions)('exams:read'),
    __param(0, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExamsController.prototype, "getStudentHistory", null);
__decorate([
    (0, common_1.Post)('grade-scales'),
    (0, index_3.RequirePermissions)('exams:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExamsController.prototype, "createGradeScale", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, index_3.RequirePermissions)('exams:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExamsController.prototype, "generateExam", null);
exports.ExamsController = ExamsController = __decorate([
    (0, common_1.Controller)('exams'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_2.RbacGuard),
    __metadata("design:paramtypes", [exams_service_1.ExamsService])
], ExamsController);
//# sourceMappingURL=exams.controller.js.map