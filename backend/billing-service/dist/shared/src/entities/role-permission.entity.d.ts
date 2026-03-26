import { Permission } from './permission.entity';
import { Role } from './role.entity';
export declare class RolePermission {
    id: string;
    role_id: string;
    permission_id: string;
    permission: Permission;
    role: Role;
}
