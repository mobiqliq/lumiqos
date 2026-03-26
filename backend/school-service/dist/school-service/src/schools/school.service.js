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
exports.SchoolService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const school_entity_1 = require("../../../shared/src/entities/school.entity");
const user_entity_1 = require("../../../shared/src/entities/user.entity");
const role_entity_1 = require("../../../shared/src/entities/role.entity");
const permission_entity_1 = require("../../../shared/src/entities/permission.entity");
const role_permission_entity_1 = require("../../../shared/src/entities/role-permission.entity");
const period_configuration_entity_1 = require("../../../shared/src/entities/period-configuration.entity");
let SchoolService = class SchoolService {
    schoolRepository;
    periodConfigRepo;
    dataSource;
    constructor(schoolRepository, periodConfigRepo, dataSource) {
        this.schoolRepository = schoolRepository;
        this.periodConfigRepo = periodConfigRepo;
        this.dataSource = dataSource;
    }
    async onboardSchool(onboardDto) {
        const { school_name, school_code, admin_email, admin_password, admin_first_name, admin_last_name } = onboardDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const newSchool = queryRunner.manager.create(school_entity_1.School, {
                school_name,
                school_code,
            });
            await queryRunner.manager.save(newSchool);
            const defaultRoles = ['super_admin', 'school_owner', 'principal', 'teacher', 'parent', 'student', 'finance_admin', 'operations_admin'];
            let ownerRole = null;
            for (const roleName of defaultRoles) {
                let role = await queryRunner.manager.findOne(role_entity_1.Role, { where: { role_name: roleName } });
                if (!role) {
                    role = queryRunner.manager.create(role_entity_1.Role, { role_name: roleName, description: `Default ${roleName} role` });
                    await queryRunner.manager.save(role_entity_1.Role, role);
                }
                if (roleName === 'school_owner') {
                    ownerRole = role;
                }
            }
            const permissionsToSeed = [
                { module: 'finance', action: 'read', description: 'Read finance Data' },
                { module: 'attendance', action: 'write', description: 'Mark attendance' },
                { module: 'system', action: 'manage', description: 'Manage system' },
            ];
            for (const p of permissionsToSeed) {
                let perm = await queryRunner.manager.findOne(permission_entity_1.Permission, { where: { module: p.module, action: p.action } });
                if (!perm) {
                    perm = queryRunner.manager.create(permission_entity_1.Permission, p);
                    await queryRunner.manager.save(perm);
                }
                if (ownerRole) {
                    const relation = await queryRunner.manager.findOne(role_permission_entity_1.RolePermission, {
                        where: { role_id: ownerRole.role_id, permission_id: perm.permission_id }
                    });
                    if (!relation) {
                        await queryRunner.manager.save(queryRunner.manager.create(role_permission_entity_1.RolePermission, {
                            role_id: ownerRole.role_id,
                            permission_id: perm.permission_id
                        }));
                    }
                }
            }
            const password_hash = await bcrypt.hash(admin_password, 10);
            const adminUser = queryRunner.manager.create(user_entity_1.User, {
                school_id: newSchool.school_id,
                email: admin_email,
                password_hash,
                first_name: admin_first_name,
                last_name: admin_last_name,
                role_id: ownerRole ? ownerRole.role_id : undefined,
            });
            await queryRunner.manager.save(adminUser);
            await queryRunner.commitTransaction();
            return {
                message: 'School onboarded successfully',
                school_id: newSchool.school_id,
            };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            console.error('Transaction failed, rolled back:', err);
            throw new common_1.InternalServerErrorException('Registration failed. Rolled back.');
        }
        finally {
            await queryRunner.release();
        }
    }
    async getSchools() {
        return this.schoolRepository.find();
    }
    async savePeriodConfig(schoolId, config) {
        let periodConfig = await this.periodConfigRepo.findOne({ where: { school_id: schoolId } });
        if (!periodConfig) {
            periodConfig = this.periodConfigRepo.create({ school_id: schoolId, config });
        }
        else {
            periodConfig.config = config;
        }
        return this.periodConfigRepo.save(periodConfig);
    }
    async getPeriodConfig(schoolId) {
        return this.periodConfigRepo.findOne({ where: { school_id: schoolId } });
    }
};
exports.SchoolService = SchoolService;
exports.SchoolService = SchoolService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(school_entity_1.School)),
    __param(1, (0, typeorm_1.InjectRepository)(period_configuration_entity_1.PeriodConfiguration)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], SchoolService);
//# sourceMappingURL=school.service.js.map