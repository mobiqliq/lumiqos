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
exports.Board = void 0;
const typeorm_1 = require("typeorm");
let Board = class Board {
};
exports.Board = Board;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Board.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Board.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'India' }),
    __metadata("design:type", String)
], Board.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 7 }),
    __metadata("design:type", Number)
], Board.prototype, "exam_buffer_days", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 14 }),
    __metadata("design:type", Number)
], Board.prototype, "revision_days", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Board.prototype, "max_sessions_per_day", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Board.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Board.prototype, "updated_at", void 0);
exports.Board = Board = __decorate([
    (0, typeorm_1.Entity)('boards')
], Board);
