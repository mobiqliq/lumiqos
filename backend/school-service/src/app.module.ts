import { TenantInterceptor } from '@lumiqos/shared';
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AcademicPlanningModule } from './academic-planning/academic-planning.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SchoolModule } from './school/school.module';
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
  ],
  providers: [
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
