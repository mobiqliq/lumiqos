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
exports.ParentController = void 0;
const common_1 = require("@nestjs/common");
const parent_service_1 = require("./parent.service");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
let ParentController = class ParentController {
    parentService;
    constructor(parentService) {
        this.parentService = parentService;
    }
    getDashboard(req, studentId) {
        return this.parentService.getDashboard(req.user.user_id, studentId);
    }
    getAttendance(req, studentId) {
        return this.parentService.getAttendanceHistory(req.user.user_id, studentId);
    }
    getHomework(req, studentId) {
        return this.parentService.getHomework(req.user.user_id, studentId);
    }
    getReportCards(req, studentId) {
        return this.parentService.getReportCards(req.user.user_id, studentId);
    }
    getFees(req, studentId) {
        return this.parentService.getFees(req.user.user_id, studentId);
    }
    getNotifications(req, limit = 20, offset = 0) {
        return this.parentService.getNotifications(req.user.user_id, limit, offset);
    }
    getMessages(req, studentId) {
        return this.parentService.getMessages(req.user.user_id, studentId);
    }
};
exports.ParentController = ParentController;
__decorate([
    (0, common_1.Get)('dashboard/:student_id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ParentController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('attendance/:student_id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ParentController.prototype, "getAttendance", null);
__decorate([
    (0, common_1.Get)('homework/:student_id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ParentController.prototype, "getHomework", null);
__decorate([
    (0, common_1.Get)('report-cards/:student_id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ParentController.prototype, "getReportCards", null);
__decorate([
    (0, common_1.Get)('fees/:student_id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ParentController.prototype, "getFees", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], ParentController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('messages/:student_id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ParentController.prototype, "getMessages", null);
exports.ParentController = ParentController = __decorate([
    (0, common_1.Controller)('parent'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_2.RbacGuard),
    (0, index_3.RequireRoles)('parent'),
    __metadata("design:paramtypes", [parent_service_1.ParentService])
], ParentController);
//# sourceMappingURL=parent.controller.js.map