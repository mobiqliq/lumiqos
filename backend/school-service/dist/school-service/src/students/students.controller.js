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
exports.StudentsController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const students_service_1 = require("./students.service");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
let StudentsController = class StudentsController {
    studentsService;
    constructor(studentsService) {
        this.studentsService = studentsService;
    }
    createStudent(dto) {
        return this.studentsService.createStudent(dto);
    }
    getStudents() {
        return this.studentsService.getStudents();
    }
    async getStudentsMicroservice() {
        return this.studentsService.getStudents();
    }
    getStudentById(id) {
        return this.studentsService.getStudentById(id);
    }
    updateStudent(id, dto) {
        return this.studentsService.updateStudent(id, dto);
    }
    deleteStudent(id) {
        return this.studentsService.deleteStudent(id);
    }
    enrollStudent(dto) {
        return this.studentsService.enrollStudent(dto);
    }
    promoteStudent(dto) {
        return this.studentsService.promoteStudent(dto.student_id, dto.current_enrollment_id, dto);
    }
    getEnrollments(studentId) {
        return this.studentsService.getEnrollmentsForStudent(studentId);
    }
    addGuardian(studentId, dto) {
        return this.studentsService.addGuardian(studentId, dto);
    }
    getGuardians(studentId) {
        return this.studentsService.getGuardians(studentId);
    }
    uploadDocument(studentId, dto) {
        return this.studentsService.uploadDocument(studentId, dto);
    }
    getGamificationProfile(studentId) {
        return this.studentsService.getGamificationProfile(studentId);
    }
    getQuests(studentId) {
        return this.studentsService.getQuests(studentId);
    }
    submitQuest(studentId, questId, dto) {
        return this.studentsService.submitQuest(studentId, questId, dto);
    }
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_1.Post)(),
    (0, index_3.RequirePermissions)('student:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "createStudent", null);
__decorate([
    (0, common_1.Get)(),
    (0, index_3.RequirePermissions)('student:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "getStudents", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_students' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getStudentsMicroservice", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, index_3.RequirePermissions)('student:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "getStudentById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, index_3.RequirePermissions)('student:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "updateStudent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, index_3.RequirePermissions)('student:write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "deleteStudent", null);
__decorate([
    (0, common_1.Post)('enroll'),
    (0, index_3.RequirePermissions)('enrollment:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "enrollStudent", null);
__decorate([
    (0, common_1.Put)('enroll/promote'),
    (0, index_3.RequirePermissions)('enrollment:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "promoteStudent", null);
__decorate([
    (0, common_1.Get)(':id/enrollments'),
    (0, index_3.RequirePermissions)('enrollment:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "getEnrollments", null);
__decorate([
    (0, common_1.Post)(':id/guardians'),
    (0, index_3.RequirePermissions)('student:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "addGuardian", null);
__decorate([
    (0, common_1.Get)(':id/guardians'),
    (0, index_3.RequirePermissions)('student:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "getGuardians", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    (0, index_3.RequirePermissions)('student:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)(':id/gamification'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "getGamificationProfile", null);
__decorate([
    (0, common_1.Get)(':id/quests'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "getQuests", null);
__decorate([
    (0, common_1.Post)(':id/quests/:questId/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('questId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "submitQuest", null);
exports.StudentsController = StudentsController = __decorate([
    (0, common_1.Controller)('students'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_2.RbacGuard),
    __metadata("design:paramtypes", [students_service_1.StudentsService])
], StudentsController);
//# sourceMappingURL=students.controller.js.map