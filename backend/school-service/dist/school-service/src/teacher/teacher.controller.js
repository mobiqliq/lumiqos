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
exports.TeacherController = void 0;
const common_1 = require("@nestjs/common");
const teacher_service_1 = require("./teacher.service");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
const microservices_1 = require("@nestjs/microservices");
let TeacherController = class TeacherController {
    teacherService;
    constructor(teacherService) {
        this.teacherService = teacherService;
    }
    getDashboard(req) {
        return this.teacherService.getDashboard(req.user.user_id);
    }
    getClasses(req) {
        return this.teacherService.getClasses(req.user.user_id);
    }
    quickAttendance(req, body) {
        return this.teacherService.submitQuickAttendance(req.user.user_id, body);
    }
    quickHomework(req, body) {
        return this.teacherService.assignQuickHomework(req.user.user_id, body);
    }
    getHomeworkSubmissions(req, limit = 25, offset = 0) {
        return this.teacherService.getHomeworkSubmissions(req.user.user_id, limit, offset);
    }
    quickGrade(req, body) {
        return this.teacherService.submitGrade(req.user.user_id, body);
    }
    getMessages(req) {
        return this.teacherService.getMessages(req.user.user_id);
    }
    async getTeachersList(data) {
        return this.teacherService.getTeachers(data.schoolId);
    }
    async getTeacherDashboard(data) {
        return this.teacherService.getDashboard(data.userId);
    }
};
exports.TeacherController = TeacherController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('classes'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "getClasses", null);
__decorate([
    (0, common_1.Post)('attendance/quick'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "quickAttendance", null);
__decorate([
    (0, common_1.Post)('homework/quick'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "quickHomework", null);
__decorate([
    (0, common_1.Get)('homework/submissions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "getHomeworkSubmissions", null);
__decorate([
    (0, common_1.Post)('grade'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "quickGrade", null);
__decorate([
    (0, common_1.Get)('messages'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_2.RbacGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "getMessages", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_teachers' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "getTeachersList", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_teacher_dashboard' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "getTeacherDashboard", null);
exports.TeacherController = TeacherController = __decorate([
    (0, common_1.Controller)('teacher'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_2.RbacGuard),
    (0, index_3.RequireRoles)('teacher'),
    __metadata("design:paramtypes", [teacher_service_1.TeacherService])
], TeacherController);
//# sourceMappingURL=teacher.controller.js.map