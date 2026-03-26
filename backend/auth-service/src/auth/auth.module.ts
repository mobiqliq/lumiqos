import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RoleSeederService } from './role-seeder.service';
import { User, Role, Permission, RolePermission } from '@lumiqos/shared/index';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Role, Permission, RolePermission]),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET || 'lumiqos-super-secret-key',
            signOptions: { expiresIn: '8h' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, RoleSeederService],
})
export class AuthModule { }
