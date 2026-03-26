import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User, Role, Permission, RolePermission, School, AcademicYear, Class, Section, Subject, TeacherSubject, Student, StudentEnrollment, StudentGuardian, StudentDocument, StudentHealthRecord } from '@lumiqos/shared/index';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'lumiqos_db',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'lumiq',
      autoLoadEntities: true,
      synchronize: true, // For MVP schema sync
      entities: [
        User, Role, Permission, RolePermission, School,
        AcademicYear, Class, Section, Subject, TeacherSubject,
        Student, StudentEnrollment, StudentGuardian, StudentDocument, StudentHealthRecord
      ],
    }),
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
