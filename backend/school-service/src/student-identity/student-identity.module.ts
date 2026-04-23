import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentIdentity } from '@xceliqos/shared/src/entities/student-identity.entity';
import { StudentPassport } from '@xceliqos/shared/src/entities/student-passport.entity';
import { Student } from '@xceliqos/shared/src/entities/student.entity';
import { StudentIdentityService } from './student-identity.service';
import { StudentIdentityController } from './student-identity.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            StudentIdentity,
            StudentPassport,
            Student,
        ]),
    ],
    controllers: [StudentIdentityController],
    providers: [StudentIdentityService],
    exports: [StudentIdentityService],
})
export class StudentIdentityModule {}
