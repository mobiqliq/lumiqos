import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { User } from '@lumiqos/shared/src/entities/user.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, TeacherSubject])
    ],
    controllers: [HrController],
    providers: [HrService],
    exports: [HrService],
})
export class HrModule {}
