import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { School } from '@xceliqos/shared/src/entities/school.entity';
import { User } from '@xceliqos/shared/src/entities/user.entity';
import { Student } from '@xceliqos/shared/src/entities/student.entity';
import { SaasPlan } from '@xceliqos/shared/src/entities/saas-plan.entity';
import { TenantSubscription } from '@xceliqos/shared/src/entities/tenant-subscription.entity';
import { StudentAttendance } from '@xceliqos/shared/src/entities/student-attendance.entity';
import { FeePayment } from '@xceliqos/shared/src/entities/fee-payment.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            School, User, Student, SaasPlan, TenantSubscription,
            StudentAttendance, FeePayment,
        ]),
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {}
