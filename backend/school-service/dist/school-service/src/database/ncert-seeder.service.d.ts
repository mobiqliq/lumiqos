import { Repository } from 'typeorm';
import { Board } from '@lumiqos/shared/src/entities/board.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { CurriculumUnit } from '@lumiqos/shared/src/entities/curriculum-unit.entity';
import { LessonPlan } from '@lumiqos/shared/src/entities/lesson-plan.entity';
import { School } from '@lumiqos/shared/src/entities/school.entity';
export declare class NCERTSeederService {
    private boardRepo;
    private subjectRepo;
    private unitRepo;
    private lessonRepo;
    private schoolRepo;
    constructor(boardRepo: Repository<Board>, subjectRepo: Repository<Subject>, unitRepo: Repository<CurriculumUnit>, lessonRepo: Repository<LessonPlan>, schoolRepo: Repository<School>);
    seedFromJSON(schoolId: string, jsonData: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
