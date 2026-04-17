import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SchoolModule } from './school/school.module';
import { LessonPlan } from '@lumiqos/shared';

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
      autoLoadEntities: true,
      synchronize: true,
    }),
    SchoolModule,
  ],
})
export class AppModule {}
