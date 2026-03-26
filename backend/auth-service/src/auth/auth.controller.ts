import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: any) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    async register(@Body() registerDto: any) {
        return this.authService.register(registerDto);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout() {
        // For JWT, logout is primarily a client-side action of discarding the token.
        return { success: true, message: 'Logged out successfully' };
    }
}
