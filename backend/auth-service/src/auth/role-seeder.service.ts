import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, RolePermission, Role, Permission } from '@lumiqos/shared/index';

@Injectable()
export class RoleSeederService implements OnModuleInit {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        console.log('--- ROLE SEEDER STARTING [STABILIZATION_V2] ---');
        await this.seedPermissions();
        await this.seedRoles();
        await this.seedRolePermissions();
    }

    private async seedPermissions() {
        const permissions = [
            { permission_id: 'user:read', name: 'Read Users', module: 'user', action: 'read' },
            { permission_id: 'user:write', name: 'Write Users', module: 'user', action: 'write' },
            { permission_id: 'school:read', name: 'Read School Defaults', module: 'school', action: 'read' },
            { permission_id: 'school:write', name: 'Modify School Settings', module: 'school', action: 'write' },
        ];

        for (const permData of permissions) {
            const existing = await this.userRepository.manager.findOne(Permission, {
                where: { permission_id: permData.permission_id },
            });
            if (!existing) {
                await this.userRepository.manager.save(Permission, permData);
                console.log(`Seeded permission: ${permData.permission_id}`);
            }
        }
    }

    private async seedRoles() {
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

    private async seedRolePermissions() {
        // Link roles to permissions
        const superAdminPerms = ['user:read', 'user:write', 'school:read', 'school:write'];
        for (const permId of superAdminPerms) {
            const existing = await this.userRepository.manager.findOne(RolePermission, {
                where: { role_id: 'SUPER_ADMIN', permission_id: permId },
            });
            if (!existing) {
                await this.userRepository.manager.save(RolePermission, {
                    role_id: 'SUPER_ADMIN',
                    permission_id: permId,
                });
            }
        }

        const teacherPerms = ['school:read'];
        for (const permId of teacherPerms) {
            const existing = await this.userRepository.manager.findOne(RolePermission, {
                where: { role_id: 'TEACHER', permission_id: permId },
            });
            if (!existing) {
                await this.userRepository.manager.save(RolePermission, {
                    role_id: 'TEACHER',
                    permission_id: permId,
                });
            }
        }
    }
}
