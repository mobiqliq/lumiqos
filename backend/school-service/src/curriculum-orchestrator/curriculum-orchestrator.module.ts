import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurriculumPlan } from '@lumiqos/shared/src/entities/curriculum-plan.entity';
import { CurriculumPlanItem } from '@lumiqos/shared/src/entities/curriculum-plan-item.entity';
import { TeachingLog } from '@lumiqos/shared/src/entities/teaching-log.entity';
import { Syllabus } from '@lumiqos/shared/src/entities/syllabus.entity';
import { AcademicCalendarEvent } from '@lumiqos/shared/src/entities/academic-calendar-event.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { School } from '@lumiqos/shared/src/entities/school.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';
import { CurriculumOrchestratorController } from './curriculum-orchestrator.controller';
import { CurriculumPlannerService } from './services/planner.service';
import { CurriculumTrackingService } from './services/tracking.service';
import { CurriculumReschedulerService } from './services/rescheduler.service';

import { AcademicPlanningModule } from '../academic-planning/academic-planning.module';

@Module({
    imports: [
        AcademicPlanningModule,
        TypeOrmModule.forFeature([
            CurriculumPlan,
            CurriculumPlanItem,
            TeachingLog,
            Syllabus,
            AcademicCalendarEvent,
            AcademicYear,
            Subject,
            School,
            Class,
            User
        ]),
    ],
    controllers: [CurriculumOrchestratorController],
    providers: [
        CurriculumPlannerService,
        CurriculumTrackingService,
        CurriculumReschedulerService,
    ],
    exports: [
        CurriculumPlannerService,
        CurriculumTrackingService,
        CurriculumReschedulerService,
    ]
})
export class CurriculumOrchestratorModule {}
