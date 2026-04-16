import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, RolePermission, Role, Permission } from '@lumiqos/shared/index';

@Injectable()
export class RoleSeederService implements OnModuleInit {
    private readonly logger = new Logger(RoleSeederService.name);

    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        this.logger.log('--- STARTING IDEMPOTENT ROLE SEEDING ---');
        try {
            await this.seedPermissions();
            await this.seedRoles();
            await this.seedRolePermissions();
            this.logger.log('--- ROLE SEEDING COMPLETED SUCCESSFULLY ---');
        } catch (error) {
            this.logger.error('CRITICAL: Role seeding failed, but service will continue to start.', error.stack);
        }
    }

    private async seedPermissions() {
        const permissions = [
            { permission_id: 'user:read', name: 'Read Users', module: 'user', action: 'read' },
            { permission_id: 'user:write', name: 'Write Users', module: 'user', action: 'write' },
            { permission_id: 'school:read', name: 'Read School Defaults', module: 'school', action: 'read' },
            { permission_id: 'school:write', name: 'Modify School Settings', module: 'school', action: 'write' },
        ];

        for (const permData of permissions) {
            try {
                const existing = await this.userRepository.manager.findOne(Permission, {
                    where: { permission_id: permData.permission_id },
                });
                if (!existing) {
                    await this.userRepository.manager.save(Permission, permData);
                    this.logger.debug(`Seeded permission: ${permData.permission_id}`);
                }
            } catch (e) {
                this.logger.warn(`Failed to seed permission ${permData.permission_id}: ${e.message}`);
            }
        }
    }

    private async seedRoles() {
        const roles = [
            { role_id: 'SUPER_ADMIN', role_name: 'SUPER_ADMIN', name: 'Super Admin', description: 'Global system administrator' },
            { role_id: 'SCHOOL_ADMIN', role_name: 'SCHOOL_ADMIN', name: 'School Admin', description: 'Administrator for a specific school' },
            { role_id: 'TEACHER', role_name: 'TEACHER', name: 'Teacher', description: 'School faculty member' },
        ];

        for (const roleData of roles) {
            try {
                const existing = await this.roleRepository.findOne({ where: { role_id: roleData.role_id } });
                if (!existing) {
                    await this.roleRepository.save(this.roleRepository.create(roleData));
                    this.logger.debug(`Seeded role: ${roleData.role_id}`);
                }
            } catch (e) {
                this.logger.warn(`Failed to seed role ${roleData.role_id}: ${e.message}`);
            }
        }
    }

    private async seedRolePermissions() {
        const mappings = [
            { roleId: 'SUPER_ADMIN', perms: ['user:read', 'user:write', 'school:read', 'school:write'] },
            { roleId: 'TEACHER', perms: ['school:read'] }
        ];

        for (const mapping of mappings) {
            for (const permId of mapping.perms) {
                try {
                    const existing = await this.userRepository.manager.findOne(RolePermission, {
                        where: { role_id: mapping.roleId, permission_id: permId },
                    });
                    if (!existing) {
                        await this.userRepository.manager.save(RolePermission, {
                            role_id: mapping.roleId,
                            permission_id: permId,
                        });
                    }
                } catch (e) {
                    this.logger.warn(`Failed to link ${mapping.roleId} to ${permId}: ${e.message}`);
                }
            }
        }
    }
}
