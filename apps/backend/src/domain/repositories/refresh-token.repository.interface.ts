import { RefreshToken } from '../entities/refresh-token.entity';

export interface IRefreshTokenRepository {
  /**
   * Persists a new refresh token record.
   * @param data - Token fields excluding auto-generated id and createdAt
   * @returns The persisted refresh token
   */
  create(
    data: Omit<RefreshToken, 'id' | 'createdAt' | 'revokedAt'>,
  ): Promise<RefreshToken>;

  /**
   * Looks up a non-revoked, non-expired token by its SHA-256 hash.
   * @param tokenHash - SHA-256 hash of the raw refresh token
   * @returns The matching token record, or null if not found / already revoked
   */
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;

  /**
   * Marks a single refresh token as revoked.
   * @param tokenHash - SHA-256 hash of the token to revoke
   */
  revokeByTokenHash(tokenHash: string): Promise<void>;

  /**
   * Revokes all active refresh tokens for a given user (e.g. on password change).
   * @param userId - UUID of the user whose tokens should be revoked
   */
  revokeAllByUserId(userId: string): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');
