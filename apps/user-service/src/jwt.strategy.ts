import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  userRole: string;
  country: string,
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.id,
      firstname: payload.firstname,
      lastname: payload.lastname,
      email: payload.email,
      userRole: payload.userRole,
      country: payload.country,
    };
  }
}
