import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantModule } from './tenant/tenant.module';
import {
    User, Role, Permission, RolePermission, School, AcademicYear,
    Class, Section, Subject, TeacherSubject,
    Student, StudentEnrollment, StudentGuardian,
    StudentDocument, StudentHealthRecord,
    ExamType, Exam, ExamSubject, GradeScale,
    StudentMarks, ReportCard, ReportCardSubject,
    HomeworkAssignment, HomeworkSubmission,
    Notification, NotificationRecipient, MessageThread, Message,
    FeeCategory, FeeStructure, StudentFeeAccount, FeeInvoice, FeePayment,
    AttendanceSession, StudentAttendance,
    SaasPlan, TenantSubscription, AnalyticsSnapshot
} from '@xceliqos/shared/index';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'xceliqos_db',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'xceliq',
            autoLoadEntities: false,
            entities: [
                User, Role, Permission, RolePermission, School, AcademicYear,
                Class, Section, Subject, TeacherSubject,
                Student, StudentEnrollment, StudentGuardian,
                StudentDocument, StudentHealthRecord,
                ExamType, Exam, ExamSubject, GradeScale,
                StudentMarks, ReportCard, ReportCardSubject,
                HomeworkAssignment, HomeworkSubmission,
                Notification, NotificationRecipient, MessageThread, Message,
                FeeCategory, FeeStructure, StudentFeeAccount, FeeInvoice, FeePayment,
                AttendanceSession, StudentAttendance,
                SaasPlan, TenantSubscription, AnalyticsSnapshot
            ],
            synchronize: true, // MVP: auto-create saas_plan, tenant_subscription tables
        }),
        TenantModule,
    ],
    controllers: [AppController],
})
export class AppModule { }
