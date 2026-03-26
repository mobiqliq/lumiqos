import { SchoolService } from './school.service';
export declare class SchoolController {
    private readonly schoolService;
    constructor(schoolService: SchoolService);
    onboardSchool(onboardDto: any): Promise<{
        message: string;
        school_id: string;
    }>;
    getSchools(): Promise<import("@lumiqos/shared/index").School[]>;
    getSchoolsMicroservice(): Promise<import("@lumiqos/shared/index").School[]>;
    getPeriodConfig(data: any): Promise<import("@lumiqos/shared/index").PeriodConfiguration | null>;
    savePeriodConfig(data: any): Promise<import("@lumiqos/shared/index").PeriodConfiguration>;
}
