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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const communication_service_1 = require("./communication.service");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
const index_4 = require("../../../shared/src/index");
let NotificationsController = class NotificationsController {
    communicationService;
    constructor(communicationService) {
        this.communicationService = communicationService;
    }
    createNotification(dto, user) {
        return this.communicationService.createNotification(dto, user.userId);
    }
    getNotifications(user) {
        return this.communicationService.getNotifications(user.userId);
    }
    markNotificationRead(dto, user) {
        return this.communicationService.markNotificationRead(dto.notification_id, user.userId);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)(),
    (0, index_3.RequirePermissions)('notifications:write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, index_4.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Get)(),
    (0, index_3.RequirePermissions)('notifications:read'),
    __param(0, (0, index_4.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Put)('read'),
    (0, index_3.RequirePermissions)('notifications:read'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, index_4.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markNotificationRead", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_2.RbacGuard),
    __metadata("design:paramtypes", [communication_service_1.CommunicationService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map