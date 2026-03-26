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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRecipient = void 0;
const typeorm_1 = require("typeorm");
const notification_entity_1 = require("./notification.entity");
let NotificationRecipient = class NotificationRecipient {
    id;
    notification_id;
    user_id;
    recipient_id;
    school_id;
    read_status;
    delivery_status;
    sent_at;
    notification;
    created_at;
};
exports.NotificationRecipient = NotificationRecipient;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NotificationRecipient.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], NotificationRecipient.prototype, "notification_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], NotificationRecipient.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], NotificationRecipient.prototype, "recipient_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], NotificationRecipient.prototype, "school_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], NotificationRecipient.prototype, "read_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], NotificationRecipient.prototype, "delivery_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], NotificationRecipient.prototype, "sent_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => notification_entity_1.Notification),
    (0, typeorm_1.JoinColumn)({ name: 'notification_id' }),
    __metadata("design:type", notification_entity_1.Notification)
], NotificationRecipient.prototype, "notification", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotificationRecipient.prototype, "created_at", void 0);
exports.NotificationRecipient = NotificationRecipient = __decorate([
    (0, typeorm_1.Entity)()
], NotificationRecipient);
//# sourceMappingURL=notification-recipient.entity.js.map