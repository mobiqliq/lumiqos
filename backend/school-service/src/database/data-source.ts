import { DataSource } from 'typeorm';
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
import { FeeInvoice } from '@lumiqos/shared/src/entities/fee-invoice.entity';
import { Syllabus } from '@lumiqos/shared/src/entities/syllabus.entity';
import { CurriculumMapping } from '@lumiqos/shared/src/entities/curriculum-mapping.entity';
import { CurriculumPlan } from '@lumiqos/shared/src/entities/curriculum-plan.entity';
import { CurriculumPlanItem } from '@lumiqos/shared/src/entities/curriculum-plan-item.entity';
import { TeachingLog } from '@lumiqos/shared/src/entities/teaching-log.entity';
import { Board } from '@lumiqos/shared/src/entities/board.entity';
import { AcademicPlan } from '@lumiqos/shared/src/entities/academic-plan.entity';
import { AcademicPlanItem } from '@lumiqos/shared/src/entities/academic-plan-item.entity';
import { PlanningCalendar } from '@lumiqos/shared/src/entities/planning-calendar.entity';
import { PlanningDay } from '@lumiqos/shared/src/entities/planning-day.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'lumiq',
    synchronize: false,
    logging: true,
    entities: [
        User, Role, Permission, RolePermission, School, AcademicYear, Class, Section, Subject, TeacherSubject,
        Student, StudentEnrollment, StudentGuardian, StudentDocument, StudentHealthRecord,
        AttendanceSession, StudentAttendance, HomeworkAssignment, HomeworkSubmission,
        ExamType, Exam, ExamSubject, StudentMarks, GradeScale, ReportCard, ReportCardSubject,
        Syllabus, CurriculumMapping, FeeInvoice, CurriculumPlan, CurriculumPlanItem, TeachingLog,
        Board, AcademicPlan, AcademicPlanItem, PlanningCalendar, PlanningDay
    ],
    migrations: ['src/migrations/*.ts'],
});
