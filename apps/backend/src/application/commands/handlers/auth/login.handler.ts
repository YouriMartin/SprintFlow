import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { LoginCommand } from '../../impl/auth/login.command';
import type { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../../domain/repositories/user.repository.interface';
import type { IRefreshTokenRepository } from '../../../../domain/repositories/refresh-token.repository.interface';
import { REFRESH_TOKEN_REPOSITORY } from '../../../../domain/repositories/refresh-token.repository.interface';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; role: string };
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<
  LoginCommand,
  LoginResult
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates credentials, signs an access token and generates a refresh token.
   * @param command - Login command containing email and password
   * @returns Access token, raw refresh token and public user fields
   * @throws NotFoundException if the email is not registered
   * @throws UnauthorizedException if the password does not match
   */
  async execute(command: LoginCommand): Promise<LoginResult> {
    const { email, password } = command.dto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`No account found for email ${email}`);
    }

    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
