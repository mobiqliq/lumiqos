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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const communication_service_1 = require("./communication.service");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
const index_4 = require("../../../shared/src/index");
let MessagesController = class MessagesController {
    communicationService;
    constructor(communicationService) {
        this.communicationService = communicationService;
    }
    createThread(dto, user) {
        return this.communicationService.createThread(dto.student_id, dto.teacher_id, user);
    }
    sendMessage(dto, user) {
        return this.communicationService.sendMessage(dto.thread_id, dto.message_text, user);
    }
    getThreadMessages(threadId, user) {
        return this.communicationService.getThreadMessages(threadId, user);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Post)('thread'),
    (0, index_3.RequirePermissions)('messages:write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, index_4.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "createThread", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, index_3.RequirePermissions)('messages:write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, index_4.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('thread/:thread_id'),
    (0, index_3.RequirePermissions)('messages:read'),
    __param(0, (0, common_1.Param)('thread_id')),
    __param(1, (0, index_4.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "getThreadMessages", null);
exports.MessagesController = MessagesController = __decorate([
    (0, common_1.Controller)('messages'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_2.RbacGuard),
    __metadata("design:paramtypes", [communication_service_1.CommunicationService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map