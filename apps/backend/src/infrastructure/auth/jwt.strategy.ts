import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * Passport strategy that validates access tokens from the Authorization header.
 * On success, attaches the decoded payload to `req.user`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('app.jwtAccessSecret') ||
        'change-me-in-production-access',
    });
  }

  /**
   * Called after the token signature is verified.
   * The returned value is attached to `req.user` by Passport.
   * @param payload - Decoded JWT payload
   * @returns The payload object to be set on the request
   */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
