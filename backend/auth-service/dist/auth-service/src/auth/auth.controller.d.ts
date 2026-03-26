import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    logout(): Promise<{
        success: boolean;
        message: string;
    }>;
}
