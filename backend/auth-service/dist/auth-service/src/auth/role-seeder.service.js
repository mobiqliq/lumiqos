"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleSeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../shared/src/index");
let RoleSeederService = class RoleSeederService {
    roleRepository;
    userRepository;
    constructor(roleRepository, userRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }
    async onModuleInit() {
        console.log('--- ROLE SEEDER STARTING [STABILIZATION_V2] ---');
        await this.seedPermissions();
        await this.seedRoles();
        await this.seedRolePermissions();
    }
    async seedPermissions() {
        const permissions = [
            { permission_id: 'user:read', name: 'Read Users', module: 'user', action: 'read' },
            { permission_id: 'user:write', name: 'Write Users', module: 'user', action: 'write' },
            { permission_id: 'school:read', name: 'Read School Defaults', module: 'school', action: 'read' },
            { permission_id: 'school:write', name: 'Modify School Settings', module: 'school', action: 'write' },
        ];
        for (const permData of permissions) {
            const existing = await this.userRepository.manager.findOne(index_1.Permission, {
                where: { permission_id: permData.permission_id },
            });
            if (!existing) {
                await this.userRepository.manager.save(index_1.Permission, permData);
                console.log(`Seeded permission: ${permData.permission_id}`);
            }
        }
    }
    async seedRoles() {
        const roles = [
            {
                role_id: 'SUPER_ADMIN',
                role_name: 'SUPER_ADMIN',
                name: 'Super Admin',
                description: 'Global system administrator',
            },
            {
                role_id: 'SCHOOL_ADMIN',
                role_name: 'SCHOOL_ADMIN',
                name: 'School Admin',
                description: 'Administrator for a specific school',
            },
            {
                role_id: 'TEACHER',
                role_name: 'TEACHER',
                name: 'Teacher',
                description: 'School faculty member',
            },
        ];
        for (const roleData of roles) {
            const existing = await this.roleRepository.findOne({
                where: { role_id: roleData.role_id },
            });
            if (!existing) {
                const role = this.roleRepository.create(roleData);
                await this.roleRepository.save(role);
                console.log(`Seeded role: ${roleData.role_name}`);
            }
        }
    }
    async seedRolePermissions() {
        const superAdminPerms = ['user:read', 'user:write', 'school:read', 'school:write'];
        for (const permId of superAdminPerms) {
            const existing = await this.userRepository.manager.findOne(index_1.RolePermission, {
                where: { role_id: 'SUPER_ADMIN', permission_id: permId },
            });
            if (!existing) {
                await this.userRepository.manager.save(index_1.RolePermission, {
                    role_id: 'SUPER_ADMIN',
                    permission_id: permId,
                });
            }
        }
        const teacherPerms = ['school:read'];
        for (const permId of teacherPerms) {
            const existing = await this.userRepository.manager.findOne(index_1.RolePermission, {
                where: { role_id: 'TEACHER', permission_id: permId },
            });
            if (!existing) {
                await this.userRepository.manager.save(index_1.RolePermission, {
                    role_id: 'TEACHER',
                    permission_id: permId,
                });
            }
        }
    }
};
exports.RoleSeederService = RoleSeederService;
exports.RoleSeederService = RoleSeederService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(index_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(index_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RoleSeederService);
//# sourceMappingURL=role-seeder.service.js.map