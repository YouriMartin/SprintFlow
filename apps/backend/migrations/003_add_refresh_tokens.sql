-- Migration: Add refresh_tokens table for JWT authentication
-- Stores hashed refresh tokens for secure token rotation

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,   -- SHA-256 of the raw token
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

COMMENT ON TABLE refresh_tokens IS 'Stores hashed refresh tokens for JWT authentication with token rotation';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA-256 hash of the raw refresh token - never store the raw token';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'Token expiration timestamp (7 days from creation)';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'Set when token is rotated or explicitly revoked via logout';

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
