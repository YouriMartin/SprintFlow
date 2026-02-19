import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { LogoutCommand } from '../../impl/auth/logout.command';
import type { IRefreshTokenRepository } from '../../../../domain/repositories/refresh-token.repository.interface';
import { REFRESH_TOKEN_REPOSITORY } from '../../../../domain/repositories/refresh-token.repository.interface';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  /**
   * Revokes the user's refresh token, effectively ending the session.
   * If the cookie is absent or the token does not exist, the operation is a no-op.
   * @param command - Contains the raw refresh token from the HTTP-only cookie
   */
  async execute(command: LogoutCommand): Promise<void> {
    if (!command.refreshToken) {
      return;
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(command.refreshToken)
      .digest('hex');

    await this.refreshTokenRepository.revokeByTokenHash(tokenHash);
  }
}
