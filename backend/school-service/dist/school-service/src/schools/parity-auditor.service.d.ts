import { Repository } from 'typeorm';
import { PlannedSchedule } from '@lumiqos/shared/src/entities/planned-schedule.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { Section } from '@lumiqos/shared/src/entities/section.entity';
export interface ParityAlert {
    class_id: string;
    class_name: string;
    subject_id: string;
    subject_name: string;
    leading_section_name: string;
    lagging_section_name: string;
    topic_gap: number;
    recommendation: string;
}
export declare class ParityAuditorService {
    private readonly scheduleRepo;
    private readonly classRepo;
    private readonly subjectRepo;
    private readonly sectionRepo;
    private readonly logger;
    constructor(scheduleRepo: Repository<PlannedSchedule>, classRepo: Repository<Class>, subjectRepo: Repository<Subject>, sectionRepo: Repository<Section>);
    getParityAudit(schoolId: string, yearId: string): Promise<ParityAlert[]>;
}
