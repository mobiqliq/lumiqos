import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { LessonPlan, TenantContext } from '@lumiqos/shared';

@Module({
    imports: [
        TypeOrmModule.forFeature([LessonPlan])
    ],
    controllers: [TeacherController],
    providers: [TeacherService, TenantContext],
    exports: [TeacherService]
})
export class TeacherModule { }
