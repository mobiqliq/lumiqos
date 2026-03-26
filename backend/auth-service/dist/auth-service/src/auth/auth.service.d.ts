import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User, RolePermission } from '@lumiqos/shared/index';
export declare class AuthService {
    private readonly userRepository;
    private readonly rolePermRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, rolePermRepository: Repository<RolePermission>, jwtService: JwtService);
    login(loginDto: any): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            school_id: string;
        };
    }>;
    register(registerDto: any): Promise<{
        message: string;
        user_id: string;
    }>;
}
