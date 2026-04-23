import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { AcademicYearController } from './academic-year.controller';
import { AcademicYearService } from './academic-year.service';
import { AcademicController } from './academic.controller';
import { AcademicService } from './academic.service';
import { StudentsController } from '../students/students.controller';
import { StudentsService } from '../students/students.service';
import { School } from '@xceliqos/shared/src/entities/school.entity';
import { User } from '@xceliqos/shared/src/entities/user.entity';
import { Role } from '@xceliqos/shared/src/entities/role.entity';
import { Permission } from '@xceliqos/shared/src/entities/permission.entity';
import { RolePermission } from '@xceliqos/shared/src/entities/role-permission.entity';
import { AcademicYear } from '@xceliqos/shared/src/entities/academic-year.entity';
import { Class } from '@xceliqos/shared/src/entities/class.entity';
import { Section } from '@xceliqos/shared/src/entities/section.entity';
import { Subject } from '@xceliqos/shared/src/entities/subject.entity';
import { TeacherSubject } from '@xceliqos/shared/src/entities/teacher-subject.entity';
import { Student } from '@xceliqos/shared/src/entities/student.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';
import { StudentGuardian } from '@xceliqos/shared/src/entities/student-guardian.entity';
import { StudentDocument } from '@xceliqos/shared/src/entities/student-document.entity';
import { StudentHealthRecord } from '@xceliqos/shared/src/entities/student-health-record.entity';
import { PeriodConfiguration } from '@xceliqos/shared/src/entities/period-configuration.entity';
import { Syllabus } from '@xceliqos/shared/src/entities/syllabus.entity';
import { SyllabusTopic } from '@xceliqos/shared/src/entities/syllabus-topic.entity';
import { Board } from '@xceliqos/shared/src/entities/board.entity';
import { CurriculumUnit } from '@xceliqos/shared/src/entities/curriculum-unit.entity';
import { LessonPlan } from '@xceliqos/shared/src/entities/lesson-plan.entity';
import { SchoolCalendar } from '@xceliqos/shared/src/entities/school-calendar.entity';
import { TimeSlot } from '@xceliqos/shared/src/entities/time-slot.entity';
import { PlannedSchedule } from '@xceliqos/shared/src/entities/planned-schedule.entity';
import { AcademicCalendarService } from './academic-calendar.service';
import { NCERTSeederService } from '../database/ncert-seeder.service';
import { PedagogicalPourService } from './pedagogical-pour.service';
import { RecoveryStrategistService } from './recovery-strategist.service';
import { SubstitutionService } from './substitution.service';
import { ComplianceAuditorService } from './compliance-auditor.service';
import { ParityAuditorService } from './parity-auditor.service';
import { WhatIfSimulatorService } from './what-if-simulator.service';
import { AcademicGateway } from './academic.gateway';
import { OnboardingService } from './onboarding.service';
import { TeacherHealthService } from './teacher-health.service';
import { ResourceAuditorService } from './resource-auditor.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            School, User, Role, Permission, RolePermission, AcademicYear, Class, Section, 
            Subject, TeacherSubject, Student, StudentEnrollment, StudentGuardian, 
            StudentDocument, StudentHealthRecord, PeriodConfiguration, Syllabus, 
            SyllabusTopic, Board, CurriculumUnit, LessonPlan, SchoolCalendar, 
            TimeSlot, PlannedSchedule
        ]),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET || 'xceliqos-super-secret-key',
        }),
    ],
    controllers: [SchoolController, AcademicYearController, AcademicController],
    providers: [
        SchoolService, AcademicYearService, AcademicService, 
        AcademicCalendarService, NCERTSeederService, PedagogicalPourService,
        RecoveryStrategistService, SubstitutionService, ComplianceAuditorService,
        ParityAuditorService, WhatIfSimulatorService, AcademicGateway, OnboardingService, 
        TeacherHealthService, ResourceAuditorService
    ],
    exports: [SchoolService, AcademicYearService, AcademicService, StudentsService, SubstitutionService]
})
export class SchoolModule { }
