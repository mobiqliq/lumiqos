import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'lumiqos-super-secret-key-production-ready',
    });
  }

  async validate(payload: any) {
    // This injects the user context (including tenant_id) into every request
    return { 
      id: payload.sub, 
      school_id: payload.school_id, 
      email: payload.email, 
      role: payload.role 
    };
  }
}
