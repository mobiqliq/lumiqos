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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const finance_service_1 = require("./finance.service");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
let FinanceController = class FinanceController {
    financeService;
    constructor(financeService) {
        this.financeService = financeService;
    }
    createFeeCategory(dto) {
        return this.financeService.createFeeCategory(dto);
    }
    getFeeCategories() {
        return this.financeService.getFeeCategories();
    }
    createFeeStructure(dto) {
        return this.financeService.createFeeStructure(dto);
    }
    getFeeStructures() {
        return this.financeService.getFeeStructures();
    }
    createStudentAccount(dto) {
        return this.financeService.createStudentAccount(dto.student_id, dto.academic_year_id);
    }
    getStudentAccounts(studentId) {
        return this.financeService.getStudentAccounts(studentId);
    }
    generateInvoice(dto) {
        return this.financeService.generateInvoice(dto);
    }
    recordPayment(dto) {
        return this.financeService.recordPayment(dto);
    }
    getStudentFeeStatus(studentId) {
        return this.financeService.getStudentFeeStatus(studentId);
    }
    getInventoryPredictions() {
        return this.financeService.getInventoryPredictions();
    }
    autoReorder(itemId) {
        return this.financeService.autoReorder(itemId);
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Post)('fee-categories'),
    (0, index_3.RequirePermissions)('finance:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "createFeeCategory", null);
__decorate([
    (0, common_1.Get)('fee-categories'),
    (0, index_3.RequirePermissions)('finance:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getFeeCategories", null);
__decorate([
    (0, common_1.Post)('fee-structures'),
    (0, index_3.RequirePermissions)('finance:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "createFeeStructure", null);
__decorate([
    (0, common_1.Get)('fee-structures'),
    (0, index_3.RequirePermissions)('finance:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getFeeStructures", null);
__decorate([
    (0, common_1.Post)('accounts'),
    (0, index_3.RequirePermissions)('finance:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "createStudentAccount", null);
__decorate([
    (0, common_1.Get)('accounts/:student_id'),
    (0, index_3.RequirePermissions)('finance:read'),
    __param(0, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getStudentAccounts", null);
__decorate([
    (0, common_1.Post)('invoices'),
    (0, index_3.RequirePermissions)('finance:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "generateInvoice", null);
__decorate([
    (0, common_1.Post)('payments'),
    (0, index_3.RequirePermissions)('finance:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Get)('student/:student_id'),
    (0, index_3.RequirePermissions)('finance:read'),
    __param(0, (0, common_1.Param)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getStudentFeeStatus", null);
__decorate([
    (0, common_1.Get)('inventory/predictions'),
    (0, index_3.RequirePermissions)('finance:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getInventoryPredictions", null);
__decorate([
    (0, common_1.Post)('inventory/reorder/:id'),
    (0, index_3.RequirePermissions)('finance:write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "autoReorder", null);
exports.FinanceController = FinanceController = __decorate([
    (0, common_1.Controller)('finance'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_2.RbacGuard),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map