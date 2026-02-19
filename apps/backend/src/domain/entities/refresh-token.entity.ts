/**
 * RefreshToken entity representing a stored hashed refresh token.
 * The raw token is never persisted — only its SHA-256 hash.
 */
export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
}
