import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SchoolModule } from './schools/school.module';
import { StudentsModule } from './students/students.module';
import { AttendanceModule } from './attendance/attendance.module';
import { HomeworkModule } from './homework/homework.module';
import { ExamsModule } from './exams/exams.module';
import { ReportCardsModule } from './report-cards/report-cards.module';
import { CommunicationModule } from './communication/communication.module';
import { FinanceModule } from './finance/finance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TeacherModule } from './teacher/teacher.module';
import { ParentModule } from './parent/parent.module';
import { User } from '@lumiqos/shared/src/entities/user.entity';
import { Role } from '@lumiqos/shared/src/entities/role.entity';
import { Permission } from '@lumiqos/shared/src/entities/permission.entity';
import { RolePermission } from '@lumiqos/shared/src/entities/role-permission.entity';
import { School } from '@lumiqos/shared/src/entities/school.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Section } from '@lumiqos/shared/src/entities/section.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { Student } from '@lumiqos/shared/src/entities/student.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { StudentGuardian } from '@lumiqos/shared/src/entities/student-guardian.entity';
import { StudentDocument } from '@lumiqos/shared/src/entities/student-document.entity';
import { StudentHealthRecord } from '@lumiqos/shared/src/entities/student-health-record.entity';
import { AttendanceSession } from '@lumiqos/shared/src/entities/attendance-session.entity';
import { StudentAttendance } from '@lumiqos/shared/src/entities/student-attendance.entity';
import { HomeworkAssignment } from '@lumiqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@lumiqos/shared/src/entities/homework-submission.entity';
import { ExamType } from '@lumiqos/shared/src/entities/exam-type.entity';
import { Exam } from '@lumiqos/shared/src/entities/exam.entity';
import { ExamSubject } from '@lumiqos/shared/src/entities/exam-subject.entity';
import { StudentMarks } from '@lumiqos/shared/src/entities/student-marks.entity';
import { GradeScale } from '@lumiqos/shared/src/entities/grade-scale.entity';
import { ReportCard } from '@lumiqos/shared/src/entities/report-card.entity';
import { ReportCardSubject } from '@lumiqos/shared/src/entities/report-card-subject.entity';
import { LessonPlan } from '@lumiqos/shared/src/entities/lesson-plan.entity';
import { FeeInvoice } from '@lumiqos/shared/src/entities/fee-invoice.entity';
import { FeePayment } from '@lumiqos/shared/src/entities/fee-payment.entity';
import { Syllabus } from '@lumiqos/shared/src/entities/syllabus.entity';
import { SyllabusTopic } from '@lumiqos/shared/src/entities/syllabus-topic.entity';
import { CurriculumMapping } from '@lumiqos/shared/src/entities/curriculum-mapping.entity';
import { CurriculumPlan } from '@lumiqos/shared/src/entities/curriculum-plan.entity';
import { CurriculumPlanItem } from '@lumiqos/shared/src/entities/curriculum-plan-item.entity';
import { TeachingLog } from '@lumiqos/shared/src/entities/teaching-log.entity';
import { Board } from '@lumiqos/shared/src/entities/board.entity';
import { AcademicPlan } from '@lumiqos/shared/src/entities/academic-plan.entity';
import { AcademicPlanItem } from '@lumiqos/shared/src/entities/academic-plan-item.entity';
import { PlanningCalendar } from '@lumiqos/shared/src/entities/planning-calendar.entity';
import { CurriculumUnit } from '@lumiqos/shared/src/entities/curriculum-unit.entity';
import { SchoolCalendar } from '@lumiqos/shared/src/entities/school-calendar.entity';
import { TimeSlot } from '@lumiqos/shared/src/entities/time-slot.entity';
import { PlannedSchedule } from '@lumiqos/shared/src/entities/planned-schedule.entity';
import { CurriculumModule } from './curriculum/curriculum.module';
import { CurriculumOrchestratorModule } from './curriculum-orchestrator/curriculum-orchestrator.module';
import { AcademicPlanningModule } from './academic-planning/academic-planning.module';
import { AiModule } from './ai/ai.module';
import { TimetableModule } from './timetable/timetable.module';
import { SubstitutionModule } from './substitution/substitution.module';
import { SeederService } from './database/seeder.service';

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
      synchronize: true, 
      logging: true,
      entities: [
        User, Role, Permission, RolePermission, School, AcademicYear, Class, Section, Subject, TeacherSubject,
        Student, StudentEnrollment, StudentGuardian, StudentDocument, StudentHealthRecord,
        AttendanceSession, StudentAttendance, HomeworkAssignment, HomeworkSubmission,
        ExamType, Exam, ExamSubject, StudentMarks, GradeScale, ReportCard, ReportCardSubject,
        Syllabus, SyllabusTopic, CurriculumMapping, FeeInvoice, FeePayment, CurriculumPlan, CurriculumPlanItem, TeachingLog,
        Board, AcademicPlan, AcademicPlanItem, PlanningCalendar,
        CurriculumUnit, SchoolCalendar, TimeSlot, PlannedSchedule, LessonPlan
      ],
    }),
    TypeOrmModule.forFeature([
      School, Student, AcademicYear, Class, Section, StudentEnrollment,
      User, AttendanceSession, StudentAttendance, FeeInvoice, FeePayment,
      Subject, Syllabus, CurriculumMapping, TeacherSubject,
      Board, CurriculumUnit, LessonPlan, SchoolCalendar, TimeSlot, PlannedSchedule
    ]),
    EventEmitterModule.forRoot(),
    SchoolModule,
    StudentsModule,
    AttendanceModule,
    HomeworkModule,
    ExamsModule,
    ReportCardsModule,
    CommunicationModule,
    FinanceModule,
    DashboardModule,
    TeacherModule,
    ParentModule,
    CurriculumModule,
    CurriculumOrchestratorModule,
    AiModule,
    TimetableModule,
    SubstitutionModule,
    AcademicPlanningModule,
  ],
  controllers: [AppController],
  providers: [SeederService],
})
export class AppModule { }
