import { AcademicPlanningModule } from './academic-planning/academic-planning.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SchoolModule } from './school/school.module';
import * as AllEntities from '@lumiqos/shared/src/entities';

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
      // We filter to ensure only classes (entities) are passed to TypeORM
      entities: Object.values(AllEntities).filter(item => typeof item === 'function'),
      synchronize: true,
      logging: true,
    }),
    SchoolModule,
    AcademicPlanningModule,
  ],
})
export class AppModule {}
