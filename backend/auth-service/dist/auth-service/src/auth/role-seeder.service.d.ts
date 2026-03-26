import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User, Role } from '@lumiqos/shared/index';
export declare class RoleSeederService implements OnModuleInit {
    private readonly roleRepository;
    private readonly userRepository;
    constructor(roleRepository: Repository<Role>, userRepository: Repository<User>);
    onModuleInit(): Promise<void>;
    private seedPermissions;
    private seedRoles;
    private seedRolePermissions;
}
