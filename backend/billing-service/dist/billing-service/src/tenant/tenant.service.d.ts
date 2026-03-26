import { Repository } from 'typeorm';
import { School, AcademicYear, User, Role, SaasPlan, TenantSubscription } from '@lumiqos/shared/index';
export declare class TenantService {
    private schoolRepo;
    private yrRepo;
    private userRepo;
    private roleRepo;
    private planRepo;
    private subRepo;
    constructor(schoolRepo: Repository<School>, yrRepo: Repository<AcademicYear>, userRepo: Repository<User>, roleRepo: Repository<Role>, planRepo: Repository<SaasPlan>, subRepo: Repository<TenantSubscription>);
    onboardTenant(payload: any): Promise<{
        tenant_id: string;
        school_code: string;
        admin_credentials: {
            email: string;
            generated_password: string;
        };
        subscription_status: {
            plan: string;
            status: string;
            renewal_date: Date;
        };
    }>;
}
