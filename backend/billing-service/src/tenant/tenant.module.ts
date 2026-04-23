import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import {
    School, AcademicYear, User, Role, SaasPlan, TenantSubscription
} from '@xceliqos/shared/index';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            School,
            AcademicYear,
            User,
            Role,
            SaasPlan,
            TenantSubscription
        ])
    ],
    controllers: [TenantController],
    providers: [TenantService],
})
export class TenantModule { }
