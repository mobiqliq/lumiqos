"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeworkModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const homework_controller_1 = require("./homework.controller");
const homework_service_1 = require("./homework.service");
const homework_assignment_entity_1 = require("../../../shared/src/entities/homework-assignment.entity");
const homework_submission_entity_1 = require("../../../shared/src/entities/homework-submission.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
let HomeworkModule = class HomeworkModule {
};
exports.HomeworkModule = HomeworkModule;
exports.HomeworkModule = HomeworkModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                homework_assignment_entity_1.HomeworkAssignment,
                homework_submission_entity_1.HomeworkSubmission,
                student_enrollment_entity_1.StudentEnrollment
            ])
        ],
        controllers: [homework_controller_1.HomeworkController],
        providers: [homework_service_1.HomeworkService],
        exports: [homework_service_1.HomeworkService],
    })
], HomeworkModule);
//# sourceMappingURL=homework.module.js.map