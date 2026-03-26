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
exports.HomeworkSubmission = void 0;
const typeorm_1 = require("typeorm");
const homework_assignment_entity_1 = require("./homework-assignment.entity");
let HomeworkSubmission = class HomeworkSubmission {
};
exports.HomeworkSubmission = HomeworkSubmission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], HomeworkSubmission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], HomeworkSubmission.prototype, "submission_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], HomeworkSubmission.prototype, "homework_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], HomeworkSubmission.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], HomeworkSubmission.prototype, "school_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], HomeworkSubmission.prototype, "submission_text", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], HomeworkSubmission.prototype, "submission_file_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], HomeworkSubmission.prototype, "teacher_remark", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], HomeworkSubmission.prototype, "teacher_feedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], HomeworkSubmission.prototype, "submission_data", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], HomeworkSubmission.prototype, "grade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], HomeworkSubmission.prototype, "graded_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], HomeworkSubmission.prototype, "submitted_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], HomeworkSubmission.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => homework_assignment_entity_1.HomeworkAssignment),
    (0, typeorm_1.JoinColumn)({ name: 'homework_id' }),
    __metadata("design:type", homework_assignment_entity_1.HomeworkAssignment)
], HomeworkSubmission.prototype, "homework", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], HomeworkSubmission.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], HomeworkSubmission.prototype, "updated_at", void 0);
exports.HomeworkSubmission = HomeworkSubmission = __decorate([
    (0, typeorm_1.Entity)()
], HomeworkSubmission);
//# sourceMappingURL=homework-submission.entity.js.map