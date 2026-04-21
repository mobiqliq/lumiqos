import { TenantInterceptor } from '@lumiqos/shared';
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
import * as AllEntities from '@lumiqos/shared/src/entities';
import { LoggingMiddleware } from './middleware/logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'lumiqos_db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'lumiq',
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
