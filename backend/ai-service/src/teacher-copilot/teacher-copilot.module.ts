import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherCopilotController } from './teacher-copilot.controller';
import { TeacherCopilotService } from './teacher-copilot.service';
import { StudentLearningProfile, AcademicYear } from '@lumiqos/shared/index';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            StudentLearningProfile,
            AcademicYear
        ])
    ],
    controllers: [TeacherCopilotController],
    providers: [TeacherCopilotService],
    exports: [TeacherCopilotService]
})
export class TeacherCopilotModule { }
