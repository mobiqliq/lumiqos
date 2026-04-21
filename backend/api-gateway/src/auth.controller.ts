import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
    constructor(private readonly httpService: HttpService) {}

    @Post('login')
    async login(@Body() body: any, @Res() res: Response) {
        try {
            const response = await firstValueFrom(
                this.httpService.post('http://auth-service:3002/auth/login', body)
            );
            return res.status(response.status).json(response.data);
        } catch (err) {
            const status = err?.response?.status || 500;
            const data = err?.response?.data || { message: 'Auth service error' };
            return res.status(status).json(data);
        }
    }

    @Post('register')
    async register(@Body() body: any, @Res() res: Response) {
        try {
            const response = await firstValueFrom(
                this.httpService.post('http://auth-service:3002/auth/register', body)
            );
            return res.status(response.status).json(response.data);
        } catch (err) {
            const status = err?.response?.status || 500;
            const data = err?.response?.data || { message: 'Auth service error' };
            return res.status(status).json(data);
        }
    }
}
