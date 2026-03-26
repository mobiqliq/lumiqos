import { Repository } from 'typeorm';
import { AnalyticsSnapshot, AcademicYear } from '@lumiqos/shared/index';
export declare class CommandCenterService {
    private snapshotRepo;
    private yrRepo;
    private cache;
    private TTL_MS;
    constructor(snapshotRepo: Repository<AnalyticsSnapshot>, yrRepo: Repository<AcademicYear>);
    private getActiveYear;
    private getCacheKey;
}
