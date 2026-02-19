import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { RefreshCommand } from '../../impl/auth/refresh.command';
import type { IRefreshTokenRepository } from '../../../../domain/repositories/refresh-token.repository.interface';
import { REFRESH_TOKEN_REPOSITORY } from '../../../../domain/repositories/refresh-token.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../../domain/repositories/user.repository.interface';

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

@CommandHandler(RefreshCommand)
export class RefreshHandler implements ICommandHandler<
  RefreshCommand,
  RefreshResult
> {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates the incoming refresh token, rotates it and issues a new access token.
   * @param command - Contains the raw refresh token from the HTTP-only cookie
   * @returns New access token and new raw refresh token
   * @throws UnauthorizedException if the token is invalid, expired or already revoked
   */
  async execute(command: RefreshCommand): Promise<RefreshResult> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(command.refreshToken)
      .digest('hex');

    const stored = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt !== null) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Rotate: revoke the old token
    await this.refreshTokenRepository.revokeByTokenHash(tokenHash);

    const user = await this.userRepository.findById(stored.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    const newTokenHash = crypto
      .createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }
}
