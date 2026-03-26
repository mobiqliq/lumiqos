"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const tenant_module_1 = require("./tenant/tenant.module");
const index_1 = require("../../shared/src/index");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'lumiqos_db',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                username: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                database: process.env.DB_NAME || 'lumiq',
                autoLoadEntities: false,
                entities: [
                    index_1.User, index_1.Role, index_1.Permission, index_1.RolePermission, index_1.School, index_1.AcademicYear,
                    index_1.Class, index_1.Section, index_1.Subject, index_1.TeacherSubject,
                    index_1.Student, index_1.StudentEnrollment, index_1.StudentGuardian,
                    index_1.StudentDocument, index_1.StudentHealthRecord,
                    index_1.ExamType, index_1.Exam, index_1.ExamSubject, index_1.GradeScale,
                    index_1.StudentMarks, index_1.ReportCard, index_1.ReportCardSubject,
                    index_1.HomeworkAssignment, index_1.HomeworkSubmission,
                    index_1.Notification, index_1.NotificationRecipient, index_1.MessageThread, index_1.Message,
                    index_1.FeeCategory, index_1.FeeStructure, index_1.StudentFeeAccount, index_1.FeeInvoice, index_1.FeePayment,
                    index_1.AttendanceSession, index_1.StudentAttendance,
                    index_1.SaasPlan, index_1.TenantSubscription, index_1.AnalyticsSnapshot
                ],
                synchronize: true,
            }),
            tenant_module_1.TenantModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map