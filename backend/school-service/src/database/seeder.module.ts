import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { School } from '@lumiqos/shared/src/entities/school.entity';
import { Student } from '@lumiqos/shared/src/entities/student.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Section } from '@lumiqos/shared/src/entities/section.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';
import { StudentAttendance } from '@lumiqos/shared/src/entities/student-attendance.entity';
import { AttendanceSession } from '@lumiqos/shared/src/entities/attendance-session.entity';
import { FeeInvoice } from '@lumiqos/shared/src/entities/fee-invoice.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { Syllabus } from '@lumiqos/shared/src/entities/syllabus.entity';
import { CurriculumMapping } from '@lumiqos/shared/src/entities/curriculum-mapping.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { Board } from '@lumiqos/shared/src/entities/board.entity';
import { SaasPlan } from '@lumiqos/shared/src/entities/saas-plan.entity';
import { TenantSubscription } from '@lumiqos/shared/src/entities/tenant-subscription.entity';
import { Role } from '@lumiqos/shared/src/entities/role.entity';
import { Permission } from '@lumiqos/shared/src/entities/permission.entity';
import { RolePermission } from '@lumiqos/shared/src/entities/role-permission.entity';

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
