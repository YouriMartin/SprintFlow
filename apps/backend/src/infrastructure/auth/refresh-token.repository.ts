import { Inject, Injectable } from '@nestjs/common';
import type { KyselyDatabase } from '../config/kysely.config';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @Inject('kysely')
    private readonly db: KyselyDatabase,
  ) {}

  /**
   * Persists a new refresh token record.
   * @param data - Token fields excluding auto-generated id, createdAt and revokedAt
   * @returns The persisted refresh token
   */
  async create(
    data: Omit<RefreshToken, 'id' | 'createdAt' | 'revokedAt'>,
  ): Promise<RefreshToken> {
    const row = await this.db
      .insertInto('refresh_tokens')
      .values({
        id: crypto.randomUUID(),
        user_id: data.userId,
        token_hash: data.tokenHash,
        expires_at: data.expiresAt,
        created_at: new Date(),
        revoked_at: null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(row);
  }

  /**
   * Looks up a non-revoked, non-expired token by its SHA-256 hash.
   * @param tokenHash - SHA-256 hash of the raw refresh token
   * @returns The matching token record, or null if not found / already revoked
   */
  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const row = await this.db
      .selectFrom('refresh_tokens')
      .selectAll()
      .where('token_hash', '=', tokenHash)
      .executeTakeFirst();

    return row ? this.mapToEntity(row) : null;
  }

  /**
   * Marks a single refresh token as revoked by setting revoked_at to now.
   * @param tokenHash - SHA-256 hash of the token to revoke
   */
  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await this.db
      .updateTable('refresh_tokens')
      .set({ revoked_at: new Date() })
      .where('token_hash', '=', tokenHash)
      .execute();
  }

  /**
   * Revokes all active refresh tokens for a given user.
   * @param userId - UUID of the user whose tokens should be revoked
   */
  async revokeAllByUserId(userId: string): Promise<void> {
    await this.db
      .updateTable('refresh_tokens')
      .set({ revoked_at: new Date() })
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .execute();
  }

  /**
   * Maps a database row to the RefreshToken domain entity.
   * @param row - Raw database row with snake_case columns
   * @returns Mapped RefreshToken entity with camelCase fields
   */
  private mapToEntity(row: {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: Date;
    created_at: Date;
    revoked_at: Date | null;
  }): RefreshToken {
    return {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      revokedAt: row.revoked_at,
    };
  }
}
