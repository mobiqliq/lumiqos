import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolTierConfig } from '@xceliqos/shared/src/entities/school-tier-config.entity';
import { RoleBundle } from '@xceliqos/shared/src/entities/role-bundle.entity';
import { Student } from '@xceliqos/shared/src/entities/student.entity';
import { SchoolTierService } from './school-tier.service';
import { SchoolTierController } from './school-tier.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SchoolTierConfig,
            RoleBundle,
            Student,
        ]),
    ],
    controllers: [SchoolTierController],
    providers: [SchoolTierService],
    exports: [SchoolTierService],
})
export class SchoolTierModule {}
