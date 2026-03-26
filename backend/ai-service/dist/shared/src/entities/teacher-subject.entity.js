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
exports.TeacherSubject = void 0;
const typeorm_1 = require("typeorm");
const class_entity_1 = require("./class.entity");
const section_entity_1 = require("./section.entity");
const subject_entity_1 = require("./subject.entity");
let TeacherSubject = class TeacherSubject {
};
exports.TeacherSubject = TeacherSubject;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TeacherSubject.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], TeacherSubject.prototype, "school_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], TeacherSubject.prototype, "teacher_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], TeacherSubject.prototype, "subject_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], TeacherSubject.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], TeacherSubject.prototype, "section_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => class_entity_1.Class),
    (0, typeorm_1.JoinColumn)({ name: 'class_id' }),
    __metadata("design:type", class_entity_1.Class)
], TeacherSubject.prototype, "class", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => section_entity_1.Section),
    (0, typeorm_1.JoinColumn)({ name: 'section_id' }),
    __metadata("design:type", section_entity_1.Section)
], TeacherSubject.prototype, "section", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_entity_1.Subject),
    (0, typeorm_1.JoinColumn)({ name: 'subject_id' }),
    __metadata("design:type", subject_entity_1.Subject)
], TeacherSubject.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TeacherSubject.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TeacherSubject.prototype, "updated_at", void 0);
exports.TeacherSubject = TeacherSubject = __decorate([
    (0, typeorm_1.Entity)()
], TeacherSubject);
//# sourceMappingURL=teacher-subject.entity.js.map