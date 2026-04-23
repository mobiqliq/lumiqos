import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { School } from '@xceliqos/shared/src/entities/school.entity';
import { User } from '@xceliqos/shared/src/entities/user.entity';
import { Role } from '@xceliqos/shared/src/entities/role.entity';
import { Permission } from '@xceliqos/shared/src/entities/permission.entity';
import { RolePermission } from '@xceliqos/shared/src/entities/role-permission.entity';
import { PeriodConfiguration } from '@xceliqos/shared/src/entities/period-configuration.entity';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School) private schoolRepository: Repository<School>,
    @InjectRepository(PeriodConfiguration) private periodConfigRepo: Repository<PeriodConfiguration>,
    private dataSource: DataSource
  ) { }

  async onboardSchool(onboardDto: any) {
    const { school_name, school_code, admin_email, admin_password, admin_first_name, admin_last_name } = onboardDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create School Record
      const newSchool = queryRunner.manager.create(School, {
        school_name,
        school_code,
      });
      await queryRunner.manager.save(newSchool);

      // 2. Seed Default Roles (if not exist)
      const defaultRoles = ['super_admin', 'school_owner', 'principal', 'teacher', 'parent', 'student', 'finance_admin', 'operations_admin'];
      let ownerRole: Role | null = null;
      for (const roleName of defaultRoles) {
        let role = await queryRunner.manager.findOne(Role, { where: { role_name: roleName } });
        if (!role) {
          role = queryRunner.manager.create(Role, { role_name: roleName, description: `Default ${roleName} role` });
          await queryRunner.manager.save(Role, role);
        }
        if (roleName === 'school_owner') {
          ownerRole = role;
        }
      }

      // 3. Seed Default Permissions (Minimal example)
      const permissionsToSeed = [
        { module: 'finance', action: 'read', description: 'Read finance Data' },
        { module: 'attendance', action: 'write', description: 'Mark attendance' },
        { module: 'system', action: 'manage', description: 'Manage system' },
        // Add more as needed
      ];

      for (const p of permissionsToSeed) {
        let perm = await queryRunner.manager.findOne(Permission, { where: { module: p.module, action: p.action } });
        if (!perm) {
          perm = queryRunner.manager.create(Permission, p);
          await queryRunner.manager.save(perm);
        }

        // Let's blindly link 'system:manage' to super_admin and school_owner for MVP
        if (ownerRole) {
          const relation = await queryRunner.manager.findOne(RolePermission, {
            where: { role_id: ownerRole.role_id, permission_id: perm.permission_id }
          });
          if (!relation) {
            await queryRunner.manager.save(queryRunner.manager.create(RolePermission, {
              role_id: ownerRole.role_id,
              permission_id: perm.permission_id
            }));
          }
        }
      }

      // 4. Create Default Admin User
      const password_hash = await bcrypt.hash(admin_password, 10);
      const adminUser = queryRunner.manager.create(User, {
        school_id: newSchool.school_id,
        email: admin_email,
        password_hash,
        first_name: admin_first_name,
        last_name: admin_last_name,
        role_id: ownerRole ? ownerRole.role_id : undefined, // 5. Assign admin role
      });

      await queryRunner.manager.save(adminUser);

      // Commit Transaction
      await queryRunner.commitTransaction();

      return {
        message: 'School onboarded successfully',
        school_id: newSchool.school_id,
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Transaction failed, rolled back:', err);
      throw new InternalServerErrorException('Registration failed. Rolled back.');
    } finally {
      await queryRunner.release();
    }
  }

  // Generic method to list schools
  async getSchools() {
    return this.schoolRepository.find();
  }

  // Period Configuration
  async savePeriodConfig(schoolId: string, config: any) {
    let periodConfig = await this.periodConfigRepo.findOne({ where: { school_id: schoolId } });
    if (!periodConfig) {
      periodConfig = this.periodConfigRepo.create({ school_id: schoolId, config });
    } else {
      periodConfig.config = config;
    }
    return this.periodConfigRepo.save(periodConfig);
  }

  async getPeriodConfig(schoolId: string) {
    return this.periodConfigRepo.findOne({ where: { school_id: schoolId } });
  }
}
