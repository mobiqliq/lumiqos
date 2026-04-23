import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { TeacherController } from './teacher.controller';
import { IntelligenceGraphController } from './intelligence-graph.controller';
import { DashboardController } from './dashboard.controller';
import { FinanceController } from './finance.controller';
import { ParentController } from './parent.controller';
import { HrController } from './hr.controller';
import { SubstitutionController } from './substitution.controller';
import { TimetableController } from './timetable.controller';
import { ReportCardsController } from './report-cards.controller';
import { ExamsController } from './exams.controller';
import { HomeworkController } from './homework.controller';
import { CommunicationController } from './communication.controller';
import { AuthController } from './auth.controller';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'xceliqos_db'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_DATABASE', 'xceliq'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([
      {
        name: 'SCHOOL_SERVICE',
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('SCHOOL_SERVICE_HOST', 'school-service'),
            port: config.get<number>('SCHOOL_SERVICE_PORT', 3000),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    HttpModule,
  ],
  controllers: [AppController, HealthController, TeacherController, IntelligenceGraphController, DashboardController, FinanceController, ParentController, HrController, SubstitutionController, TimetableController, ReportCardsController, ExamsController, HomeworkController, CommunicationController, AuthController, AdminController],
  providers: [AppService],
})
export class AppModule {}
