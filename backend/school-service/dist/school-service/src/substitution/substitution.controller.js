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
exports.SubstitutionController = void 0;
const common_1 = require("@nestjs/common");
const substitution_service_1 = require("./substitution.service");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
let SubstitutionController = class SubstitutionController {
    substitutionService;
    constructor(substitutionService) {
        this.substitutionService = substitutionService;
    }
    getAbsences() {
        return this.substitutionService.getAbsences();
    }
    allocateSubstitutes(body) {
        return this.substitutionService.allocateSubstitutes(body.absenceId, body.absentTeacherId, body.periods);
    }
    notifySubstitutes(body) {
        return this.substitutionService.notifySubstitutes(body.allocations);
    }
};
exports.SubstitutionController = SubstitutionController;
__decorate([
    (0, common_1.Get)('absences'),
    (0, index_3.RequirePermissions)('admin:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubstitutionController.prototype, "getAbsences", null);
__decorate([
    (0, common_1.Post)('allocate'),
    (0, index_3.RequirePermissions)('admin:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubstitutionController.prototype, "allocateSubstitutes", null);
__decorate([
    (0, common_1.Post)('notify'),
    (0, index_3.RequirePermissions)('admin:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubstitutionController.prototype, "notifySubstitutes", null);
exports.SubstitutionController = SubstitutionController = __decorate([
    (0, common_1.Controller)('substitution'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_2.RbacGuard),
    __metadata("design:paramtypes", [substitution_service_1.SubstitutionService])
], SubstitutionController);
//# sourceMappingURL=substitution.controller.js.map