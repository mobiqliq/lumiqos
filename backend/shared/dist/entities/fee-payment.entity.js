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
exports.FeePayment = void 0;
const typeorm_1 = require("typeorm");
const fee_invoice_entity_1 = require("./fee-invoice.entity");
let FeePayment = class FeePayment {
};
exports.FeePayment = FeePayment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FeePayment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], FeePayment.prototype, "invoice_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fee_invoice_entity_1.FeeInvoice),
    (0, typeorm_1.JoinColumn)({ name: 'invoice_id' }),
    __metadata("design:type", fee_invoice_entity_1.FeeInvoice)
], FeePayment.prototype, "invoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], FeePayment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], FeePayment.prototype, "school_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FeePayment.prototype, "payment_date", void 0);
exports.FeePayment = FeePayment = __decorate([
    (0, typeorm_1.Entity)()
], FeePayment);
