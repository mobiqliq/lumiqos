"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherCopilotModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const teacher_copilot_controller_1 = require("./teacher-copilot.controller");
const teacher_copilot_service_1 = require("./teacher-copilot.service");
const index_1 = require("../../../shared/src/index");
let TeacherCopilotModule = class TeacherCopilotModule {
};
exports.TeacherCopilotModule = TeacherCopilotModule;
exports.TeacherCopilotModule = TeacherCopilotModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                index_1.StudentLearningProfile,
                index_1.AcademicYear
            ])
        ],
        controllers: [teacher_copilot_controller_1.TeacherCopilotController],
        providers: [teacher_copilot_service_1.TeacherCopilotService],
        exports: [teacher_copilot_service_1.TeacherCopilotService]
    })
], TeacherCopilotModule);
//# sourceMappingURL=teacher-copilot.module.js.map