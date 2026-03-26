"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const index_1 = require("../../../shared/src/index");
let AuthService = class AuthService {
    userRepository;
    rolePermRepository;
    jwtService;
    constructor(userRepository, rolePermRepository, jwtService) {
        this.userRepository = userRepository;
        this.rolePermRepository = rolePermRepository;
        this.jwtService = jwtService;
        console.log('--- AUTH SERVICE INITIALIZED [STABILIZATION_V2] ---');
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['role'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
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
    async register(registerDto) {
        const { email, password, first_name, last_name, school_id, role_name } = registerDto;
        const existing = await this.userRepository.findOne({ where: { email } });
        if (existing) {
            throw new common_1.UnauthorizedException('Email already exists');
        }
        const password_hash = await bcrypt.hash(password, 10);
        let role = await this.userRepository.manager.findOne(index_1.Role, { where: { role_name: role_name || 'TEACHER' } });
        if (!role) {
            const normalizedRole = (role_name || 'TEACHER').toUpperCase();
            role = await this.userRepository.manager.save(index_1.Role, {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(index_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(index_1.RolePermission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map