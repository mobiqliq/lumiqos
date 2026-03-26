"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const finance_controller_1 = require("./finance.controller");
const finance_service_1 = require("./finance.service");
const fee_category_entity_1 = require("../../../shared/src/entities/fee-category.entity");
const fee_structure_entity_1 = require("../../../shared/src/entities/fee-structure.entity");
const student_fee_account_entity_1 = require("../../../shared/src/entities/student-fee-account.entity");
const fee_invoice_entity_1 = require("../../../shared/src/entities/fee-invoice.entity");
const fee_payment_entity_1 = require("../../../shared/src/entities/fee-payment.entity");
const student_entity_1 = require("../../../shared/src/entities/student.entity");
const inventory_item_entity_1 = require("../../../shared/src/entities/inventory-item.entity");
let FinanceModule = class FinanceModule {
};
exports.FinanceModule = FinanceModule;
exports.FinanceModule = FinanceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                fee_category_entity_1.FeeCategory,
                fee_structure_entity_1.FeeStructure,
                student_fee_account_entity_1.StudentFeeAccount,
                fee_invoice_entity_1.FeeInvoice,
                fee_payment_entity_1.FeePayment,
                student_entity_1.Student,
                inventory_item_entity_1.InventoryItem
            ])
        ],
        controllers: [finance_controller_1.FinanceController],
        providers: [finance_service_1.FinanceService],
        exports: [finance_service_1.FinanceService]
    })
], FinanceModule);
//# sourceMappingURL=finance.module.js.map