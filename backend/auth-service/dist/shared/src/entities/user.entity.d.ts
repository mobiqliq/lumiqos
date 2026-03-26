import { Role } from './role.entity';
export declare class User {
    id: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    user_id: string;
    school_id: string;
    role_id: string;
    status: string;
    role: Role;
    created_at: Date;
    updated_at: Date;
}
