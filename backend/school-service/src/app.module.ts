import { TenantInterceptor } from '@xceliqos/shared';
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AcademicPlanningModule } from './academic-planning/academic-planning.module';
import { IntelligenceGraphModule } from './intelligence-graph/intelligence-graph.module';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SchoolModule } from './school/school.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FinanceModule } from './finance/finance.module';
import { ParentModule } from './parent/parent.module';
import { HrModule } from './hr/hr.module';
import { SubstitutionModule } from './substitution/substitution.module';
import { TimetableModule } from './timetable/timetable.module';
import { ReportCardsModule } from './report-cards/report-cards.module';
import { ExamsModule } from './exams/exams.module';
import { HomeworkModule } from './homework/homework.module';
import { CommunicationModule } from './communication/communication.module';
import { SeederModule } from './database/seeder.module';
import { AdminModule } from './admin/admin.module';
import { SchoolConfigModule } from './school-config/school-config.module';
import { StudentIdentityModule } from './student-identity/student-identity.module';
import { XceliQScoreModule } from './xceliq-score/xceliq-score.module';
import { SchoolTierModule } from './school-tier/school-tier.module';
import { XceliQChatModule } from './xceliq-chat/xceliq-chat.module';
import { ParentCommsModule } from './parent-comms/parent-comms.module';
import { HomeworkTransparencyModule } from './homework-transparency/homework-transparency.module';
import { ExamEngineModule } from './exam-engine/exam-engine.module';
import { CurriculumCalendarModule } from './curriculum-calendar/curriculum-calendar.module';
import { XceliQReviseModule } from './xceliq-revise/xceliq-revise.module';
import { XceliQAssistantModule } from './xceliq-assistant/xceliq-assistant.module';
import { PredictiveAnalyticsModule } from './predictive-analytics/predictive-analytics.module';
import { PTCMModule } from './ptcm/ptcm.module';
import { TeacherWellbeingModule } from './teacher-wellbeing/teacher-wellbeing.module';
import { StudentWellbeingModule } from './student-wellbeing/student-wellbeing.module';
import { ComplianceModule } from './compliance/compliance.module';
import * as AllEntities from '@xceliqos/shared/src/entities';
import { LoggingMiddleware } from './middleware/logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'xceliqos_db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'xceliq',
      entities: Object.values(AllEntities).filter(item => typeof item === 'function'),
      synchronize: true,
      logging: true,
    }),
    SchoolModule,
    AcademicPlanningModule,
    IntelligenceGraphModule,
    DashboardModule,
    FinanceModule,
    ParentModule,
    HrModule,
    SubstitutionModule,
    TimetableModule,
    ReportCardsModule,
    ExamsModule,
    HomeworkModule,
    CommunicationModule,
    SeederModule,
    AdminModule,
    SchoolConfigModule,
    StudentIdentityModule,
    XceliQScoreModule,
    SchoolTierModule,
    XceliQChatModule,
    ParentCommsModule,
    HomeworkTransparencyModule,
    ExamEngineModule,
    CurriculumCalendarModule,
    XceliQReviseModule,
    XceliQAssistantModule,
    PredictiveAnalyticsModule,
    PTCMModule,
    TeacherWellbeingModule,
    StudentWellbeingModule,
    ComplianceModule,
  ],
  providers: [
    Reflector,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*");
  }
}
