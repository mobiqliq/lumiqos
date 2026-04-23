import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import {
    School,
    AcademicYear,
    User,
    Role,
    SaasPlan,
    TenantSubscription
} from '@xceliqos/shared/index';

@Injectable()
export class TenantService {
    constructor(
        @InjectRepository(School) private schoolRepo: Repository<School>,
        @InjectRepository(AcademicYear) private yrRepo: Repository<AcademicYear>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Role) private roleRepo: Repository<Role>,
        @InjectRepository(SaasPlan) private planRepo: Repository<SaasPlan>,
        @InjectRepository(TenantSubscription) private subRepo: Repository<TenantSubscription>
    ) { }

    async onboardTenant(payload: any) {
        const name = payload.name || payload.school_name || 'New School';
        const schoolId = payload.school_id || name.toLowerCase().replace(/\s+/g, '-') + '-' + crypto.randomBytes(2).toString('hex');
        const schoolCode = payload.school_code || name.substring(0, 3).toUpperCase() + crypto.randomBytes(2).toString('hex').toUpperCase();

        // Step 1: Create School
        let school = this.schoolRepo.create({
            name: name,
            school_name: name,
            school_id: schoolId,
            school_code: schoolCode,
            country: payload.country || 'IN',
            timezone: payload.timezone || 'Asia/Kolkata',
            region: payload.region || 'ap-south-1'
        });
        school = await this.schoolRepo.save(school);

        // Step 2: Create Academic Year
        const yearName = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
        await this.yrRepo.save(this.yrRepo.create({
            name: yearName,
            year_name: yearName,
            academic_year_id: `AY-${yearName}`,
            school_id: school.school_id,
            start_date: new Date(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            status: 'active'
        }));

        // Step 3: Ensure Admin Role exists
        let ownerRole = await this.roleRepo.findOne({ where: { role_name: 'SCHOOL_ADMIN' } });
        if (!ownerRole) {
            ownerRole = await this.roleRepo.save(this.roleRepo.create({
                role_id: 'SCHOOL_ADMIN',
                role_name: 'SCHOOL_ADMIN',
                name: 'School Admin',
                description: 'Super Admin binding for individual Tenants'
            }));
        }

        // Step 4: Create Default School Owner User
        const passwordRef = crypto.randomBytes(8).toString('hex');
        const adminUser = await this.userRepo.save(this.userRepo.create({
            school_id: school.school_id,
            role_id: ownerRole.role_id,
            first_name: payload.admin_first_name || 'Admin',
            last_name: payload.admin_last_name || 'User',
            email: payload.admin_email,
            password_hash: `hashed_${passwordRef}`, // Real env uses bcryptjs
            status: 'active',
            user_id: `admin-${school.school_id}`
        }));

        // Step 5: SaaS Subscription
        const planName = payload.plan || 'Starter';
        let defaultPlan = await this.planRepo.findOne({ where: { name: planName } });
        if (!defaultPlan) {
            defaultPlan = await this.planRepo.save(this.planRepo.create({
                name: planName,
                plan_id: planName.toLowerCase(),
                max_students: 500,
                max_teachers: 50,
                ai_features_enabled: false,
                analytics_enabled: true
            }));
        }

        const subscription = await this.subRepo.save(this.subRepo.create({
            school_id: school.school_id,
            plan_id: defaultPlan.plan_id,
            status: 'active',
            current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1))
        }));

        return {
            tenant_id: school.school_id,
            school_code: school.school_code,
            admin_credentials: {
                email: adminUser.email,
                generated_password: passwordRef
            },
            subscription_status: {
                plan: defaultPlan.name,
                status: subscription.status,
                renewal_date: subscription.current_period_end
            }
        };
    }
}
