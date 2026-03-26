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
exports.SyllabusTopic = void 0;
const typeorm_1 = require("typeorm");
const syllabus_entity_1 = require("./syllabus.entity");
let SyllabusTopic = class SyllabusTopic {
    id;
    syllabus_id;
    topic_name;
    sequence;
    syllabus;
    created_at;
    updated_at;
};
exports.SyllabusTopic = SyllabusTopic;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SyllabusTopic.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SyllabusTopic.prototype, "syllabus_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SyllabusTopic.prototype, "topic_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SyllabusTopic.prototype, "sequence", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => syllabus_entity_1.Syllabus, (s) => s.topics),
    (0, typeorm_1.JoinColumn)({ name: 'syllabus_id' }),
    __metadata("design:type", syllabus_entity_1.Syllabus)
], SyllabusTopic.prototype, "syllabus", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SyllabusTopic.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SyllabusTopic.prototype, "updated_at", void 0);
exports.SyllabusTopic = SyllabusTopic = __decorate([
    (0, typeorm_1.Entity)()
], SyllabusTopic);
//# sourceMappingURL=syllabus-topic.entity.js.map