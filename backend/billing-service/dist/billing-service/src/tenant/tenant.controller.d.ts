import { TenantService } from './tenant.service';
export declare class TenantController {
    private readonly tenantService;
    constructor(tenantService: TenantService);
    onboardTenant(req: any, payload: any): Promise<{
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
