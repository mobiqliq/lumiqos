"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubstitutionModule = void 0;
const common_1 = require("@nestjs/common");
const substitution_controller_1 = require("./substitution.controller");
const substitution_service_1 = require("./substitution.service");
const ai_module_1 = require("../ai/ai.module");
let SubstitutionModule = class SubstitutionModule {
};
exports.SubstitutionModule = SubstitutionModule;
exports.SubstitutionModule = SubstitutionModule = __decorate([
    (0, common_1.Module)({
        imports: [ai_module_1.AiModule],
        controllers: [substitution_controller_1.SubstitutionController],
        providers: [substitution_service_1.SubstitutionService],
    })
], SubstitutionModule);
//# sourceMappingURL=substitution.module.js.map