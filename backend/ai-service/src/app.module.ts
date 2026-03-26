import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from './ai/ai.module';
// Unstable AI modules disabled until code is stabilized
// import { CommandCenterModule } from './command-center/command-center.module';
// import { StudentProfileModule } from './student-profile/student-profile.module';
// import { TeacherCopilotModule } from './teacher-copilot/teacher-copilot.module';
// import { ParentEngagementModule } from './parent-engagement/parent-engagement.module';
import {
    User, Role, Permission, RolePermission, School, AcademicYear, Class, Section, Subject, TeacherSubject,
    Student, StudentEnrollment, StudentGuardian, StudentDocument, StudentHealthRecord,
    ExamType, Exam, ExamSubject, GradeScale, StudentMarks, ReportCard, ReportCardSubject,
    HomeworkAssignment, HomeworkSubmission, Notification, NotificationRecipient,
    MessageThread, Message, FeeCategory, FeeStructure, StudentFeeAccount, FeeInvoice, FeePayment,
    AttendanceSession, StudentAttendance, AnalyticsSnapshot, StudentLearningProfile
} from '@lumiqos/shared/index';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_DATABASE || 'lumiqos',
            autoLoadEntities: false,
            entities: [
                User, Role, Permission, RolePermission, School, AcademicYear, Class, Section, Subject, TeacherSubject,
                Student, StudentEnrollment, StudentGuardian, StudentDocument, StudentHealthRecord,
                ExamType, Exam, ExamSubject, GradeScale, StudentMarks, ReportCard, ReportCardSubject,
                HomeworkAssignment, HomeworkSubmission, Notification, NotificationRecipient,
                MessageThread, Message, FeeCategory, FeeStructure, StudentFeeAccount, FeeInvoice, FeePayment,
                AttendanceSession, StudentAttendance, AnalyticsSnapshot, StudentLearningProfile
            ],
            synchronize: false,
        }),
        AiModule,
        // CommandCenterModule,    // Disabled: requires stabilization
        // StudentProfileModule,   // Disabled: requires stabilization
        // TeacherCopilotModule,   // Disabled: requires stabilization
        // ParentEngagementModule  // Disabled: requires stabilization
    ],
})
export class AppModule { }
