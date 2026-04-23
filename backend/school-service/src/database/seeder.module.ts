import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { School } from '@xceliqos/shared/src/entities/school.entity';
import { Student } from '@xceliqos/shared/src/entities/student.entity';
import { AcademicYear } from '@xceliqos/shared/src/entities/academic-year.entity';
import { Class } from '@xceliqos/shared/src/entities/class.entity';
import { Section } from '@xceliqos/shared/src/entities/section.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';
import { User } from '@xceliqos/shared/src/entities/user.entity';
import { StudentAttendance } from '@xceliqos/shared/src/entities/student-attendance.entity';
import { AttendanceSession } from '@xceliqos/shared/src/entities/attendance-session.entity';
import { FeeInvoice } from '@xceliqos/shared/src/entities/fee-invoice.entity';
import { Subject } from '@xceliqos/shared/src/entities/subject.entity';
import { Syllabus } from '@xceliqos/shared/src/entities/syllabus.entity';
import { CurriculumMapping } from '@xceliqos/shared/src/entities/curriculum-mapping.entity';
import { TeacherSubject } from '@xceliqos/shared/src/entities/teacher-subject.entity';
import { Board } from '@xceliqos/shared/src/entities/board.entity';
import { SaasPlan } from '@xceliqos/shared/src/entities/saas-plan.entity';
import { TenantSubscription } from '@xceliqos/shared/src/entities/tenant-subscription.entity';
import { Role } from '@xceliqos/shared/src/entities/role.entity';
import { Permission } from '@xceliqos/shared/src/entities/permission.entity';
import { RolePermission } from '@xceliqos/shared/src/entities/role-permission.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            School, Student, AcademicYear, Class, Section, StudentEnrollment,
            User, StudentAttendance, AttendanceSession, FeeInvoice, Subject,
            Syllabus, CurriculumMapping, TeacherSubject, Board, Role, SaasPlan, TenantSubscription,
            Permission, RolePermission,
        ]),
    ],
    providers: [SeederService],
})
export class SeederModule {}
