import { Injectable, Logger, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, RolePermission, Role } from '@xceliqos/shared/index';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(RolePermission) private readonly rolePermRepository: Repository<RolePermission>,
    private readonly jwtService: JwtService,
  ) {
    this.logger.log('--- AUTH SERVICE INITIALIZED [STABILIZATION_V2] ---');
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get permissions for user's role
    const rolePermissions = await this.rolePermRepository.find({
      where: { role_id: user.role_id },
      relations: ['permission'],
    });

    const permissions = rolePermissions.map(rp => `${rp.permission.module}:${rp.permission.action}`);

    const payload = {
      user_id: user.user_id || user.id,
      school_id: user.school_id || 'default',
      role: user.role?.role_name || 'unknown',
      permissions,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
      user: {
        id: user.user_id || user.id,
        email: user.email,
        name: `${user.first_name || 'User'} ${user.last_name || ''}`.trim(),
        role: user.role?.role_name,
        school_id: user.school_id || 'default',
      }
    };
  }

  async register(registerDto: any) {
    const { email, password, first_name, last_name, school_id, role_name } = registerDto;

    // Check if user exists
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new UnauthorizedException('Email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Find role
    let role = await this.userRepository.manager.findOne(Role, { where: { role_name: role_name || 'TEACHER' } });

    if (!role) {
      const normalizedRole = (role_name || 'TEACHER').toUpperCase();
      role = await this.userRepository.manager.save(Role, {
        role_id: normalizedRole,
        role_name: normalizedRole,
        name: normalizedRole.charAt(0) + normalizedRole.slice(1).toLowerCase(),
        description: `Auto-generated ${normalizedRole} role`,
      });
    }

    const user = this.userRepository.create({
      email,
      password_hash,
      first_name: first_name || 'Admin',
      last_name: last_name || 'User',
      school_id: school_id || 'default',
      role_id: role.role_id,
    });

    // Ensure user_id is populated (UUID from primary key or auto-generate)
    await this.userRepository.save(user);

    if (!user.user_id) {
      user.user_id = user.id;
      await this.userRepository.save(user);
    }

    return {
      message: 'User registered successfully',
      user_id: user.user_id,
    };
  }
}
