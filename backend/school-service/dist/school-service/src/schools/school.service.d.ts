import { Repository, DataSource } from 'typeorm';
import { School } from '@lumiqos/shared/src/entities/school.entity';
import { PeriodConfiguration } from '@lumiqos/shared/src/entities/period-configuration.entity';
export declare class SchoolService {
    private schoolRepository;
    private periodConfigRepo;
    private dataSource;
    constructor(schoolRepository: Repository<School>, periodConfigRepo: Repository<PeriodConfiguration>, dataSource: DataSource);
    onboardSchool(onboardDto: any): Promise<{
        message: string;
        school_id: string;
    }>;
    getSchools(): Promise<School[]>;
    savePeriodConfig(schoolId: string, config: any): Promise<PeriodConfiguration>;
    getPeriodConfig(schoolId: string): Promise<PeriodConfiguration | null>;
}
