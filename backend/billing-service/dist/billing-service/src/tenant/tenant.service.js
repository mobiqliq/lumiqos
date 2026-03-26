"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = __importStar(require("crypto"));
const index_1 = require("../../../shared/src/index");
let TenantService = class TenantService {
    schoolRepo;
    yrRepo;
    userRepo;
    roleRepo;
    planRepo;
    subRepo;
    constructor(schoolRepo, yrRepo, userRepo, roleRepo, planRepo, subRepo) {
        this.schoolRepo = schoolRepo;
        this.yrRepo = yrRepo;
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.planRepo = planRepo;
        this.subRepo = subRepo;
    }
    async onboardTenant(payload) {
        const name = payload.name || payload.school_name || 'New School';
        const schoolId = payload.school_id || name.toLowerCase().replace(/\s+/g, '-') + '-' + crypto.randomBytes(2).toString('hex');
        const schoolCode = payload.school_code || name.substring(0, 3).toUpperCase() + crypto.randomBytes(2).toString('hex').toUpperCase();
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
        let ownerRole = await this.roleRepo.findOne({ where: { role_name: 'SCHOOL_ADMIN' } });
        if (!ownerRole) {
            ownerRole = await this.roleRepo.save(this.roleRepo.create({
                role_id: 'SCHOOL_ADMIN',
                role_name: 'SCHOOL_ADMIN',
                name: 'School Admin',
                description: 'Super Admin binding for individual Tenants'
            }));
        }
        const passwordRef = crypto.randomBytes(8).toString('hex');
        const adminUser = await this.userRepo.save(this.userRepo.create({
            school_id: school.school_id,
            role_id: ownerRole.role_id,
            first_name: payload.admin_first_name || 'Admin',
            last_name: payload.admin_last_name || 'User',
            email: payload.admin_email,
            password_hash: `hashed_${passwordRef}`,
            status: 'active',
            user_id: `admin-${school.school_id}`
        }));
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
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(index_1.School)),
    __param(1, (0, typeorm_1.InjectRepository)(index_1.AcademicYear)),
    __param(2, (0, typeorm_1.InjectRepository)(index_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(index_1.Role)),
    __param(4, (0, typeorm_1.InjectRepository)(index_1.SaasPlan)),
    __param(5, (0, typeorm_1.InjectRepository)(index_1.TenantSubscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TenantService);
//# sourceMappingURL=tenant.service.js.map