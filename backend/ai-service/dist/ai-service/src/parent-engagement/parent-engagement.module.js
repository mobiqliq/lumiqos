"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentEngagementModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const parent_engagement_controller_1 = require("./parent-engagement.controller");
const parent_engagement_service_1 = require("./parent-engagement.service");
const index_1 = require("../../../shared/src/index");
let ParentEngagementModule = class ParentEngagementModule {
};
exports.ParentEngagementModule = ParentEngagementModule;
exports.ParentEngagementModule = ParentEngagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                index_1.StudentLearningProfile, index_1.StudentGuardian, index_1.StudentAttendance, index_1.HomeworkSubmission,
                index_1.FeeInvoice, index_1.AcademicYear
            ])
        ],
        controllers: [parent_engagement_controller_1.ParentEngagementController],
        providers: [parent_engagement_service_1.ParentEngagementService],
        exports: [parent_engagement_service_1.ParentEngagementService]
    })
], ParentEngagementModule);
//# sourceMappingURL=parent-engagement.module.js.map