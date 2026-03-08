-- ============================================================
-- SprintFlow – Full schema (single source of truth)
-- ============================================================

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE users (
  id         UUID         PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  name       VARCHAR(255) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(50)  NOT NULL CHECK (role IN ('superadmin', 'dev')),
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── REFRESH TOKENS ──────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT        NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- ─── PROJECTS ─────────────────────────────────────────────────
CREATE TABLE projects (
  id          UUID         PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(50)  NOT NULL CHECK (status IN ('active', 'archived', 'on_hold')),
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── PROJECT–USER (many-to-many) ──────────────────────────────
CREATE TABLE project_users (
  project_id UUID      NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    UUID      NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, user_id)
);

-- ─── EPICS ────────────────────────────────────────────────────
CREATE TABLE epics (
  id                    UUID         PRIMARY KEY,
  title                 VARCHAR(255) NOT NULL,
  description           TEXT,
  status                VARCHAR(50)  NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  start_date            TIMESTAMP    NOT NULL,
  end_date              TIMESTAMP    NOT NULL,
  is_visible_in_roadmap BOOLEAN      NOT NULL DEFAULT TRUE,
  project_id            UUID         REFERENCES projects(id) ON DELETE SET NULL,
  created_by            UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  updated_by            UUID         REFERENCES users(id) ON DELETE SET NULL,
  deleted_by            UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at            TIMESTAMP
);

-- ─── SPRINTS ──────────────────────────────────────────────────
CREATE TABLE sprints (
  id            UUID         PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  goal          TEXT,
  sprint_number INTEGER      NOT NULL,
  start_date    TIMESTAMP    NOT NULL,
  end_date      TIMESTAMP    NOT NULL,
  status        VARCHAR(50)  NOT NULL CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  velocity      INTEGER,
  capacity      INTEGER,
  project_id    UUID         REFERENCES projects(id) ON DELETE SET NULL,
  created_by    UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  updated_by    UUID         REFERENCES users(id) ON DELETE SET NULL,
  deleted_by    UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP
);

-- ─── USER STORIES ─────────────────────────────────────────────
-- status is a free VARCHAR driven by per-project workflow_statuses (no CHECK constraint)
CREATE TABLE user_stories (
  id          UUID         PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(50)  NOT NULL,
  priority    VARCHAR(50)  NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee    VARCHAR(255),
  due_date    TIMESTAMP,
  project_id  UUID         REFERENCES projects(id),
  epic_id     UUID         REFERENCES epics(id)   ON DELETE SET NULL,
  sprint_id   UUID         REFERENCES sprints(id) ON DELETE SET NULL,
  created_by  UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  updated_by  UUID         REFERENCES users(id) ON DELETE SET NULL,
  deleted_by  UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at  TIMESTAMP
);

-- ─── CODE REPOSITORIES ────────────────────────────────────────
CREATE TABLE code_repositories (
  id              UUID         PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  repository_url  VARCHAR(500) NOT NULL,
  repository_type VARCHAR(50)  NOT NULL CHECK (repository_type IN ('gitlab', 'github')),
  repository_id   VARCHAR(255),
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── USER STORY–CODE REPOSITORY (many-to-many) ────────────────
CREATE TABLE user_story_code_repositories (
  user_story_id      UUID      NOT NULL REFERENCES user_stories(id)      ON DELETE CASCADE,
  code_repository_id UUID      NOT NULL REFERENCES code_repositories(id) ON DELETE CASCADE,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_story_id, code_repository_id)
);

-- ─── WORKFLOW STATUSES ────────────────────────────────────────
CREATE TABLE workflow_statuses (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  key         VARCHAR(50)  NOT NULL,
  label       VARCHAR(100) NOT NULL,
  group_names TEXT[]       NOT NULL DEFAULT '{}',
  sort_order  INTEGER      NOT NULL DEFAULT 0,
  color       VARCHAR(20)  NOT NULL DEFAULT '#6b7280',
  is_initial  BOOLEAN      NOT NULL DEFAULT false,
  is_terminal BOOLEAN      NOT NULL DEFAULT false,
  pos_x       FLOAT        NOT NULL DEFAULT 0,
  pos_y       FLOAT        NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (project_id, key)
);

-- ─── WORKFLOW TRANSITIONS ─────────────────────────────────────
CREATE TABLE workflow_transitions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID        NOT NULL REFERENCES projects(id)          ON DELETE CASCADE,
  from_status_id UUID        NOT NULL REFERENCES workflow_statuses(id) ON DELETE CASCADE,
  to_status_id   UUID        NOT NULL REFERENCES workflow_statuses(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_status_id, to_status_id)
);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX idx_users_email                             ON users (email);
CREATE INDEX idx_users_role                              ON users (role);
CREATE INDEX idx_refresh_tokens_user_id                  ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token_hash               ON refresh_tokens (token_hash);
CREATE INDEX idx_projects_status                         ON projects (status);
CREATE INDEX idx_project_users_project_id                ON project_users (project_id);
CREATE INDEX idx_project_users_user_id                   ON project_users (user_id);
CREATE INDEX idx_epics_status                            ON epics (status);
CREATE INDEX idx_epics_start_date                        ON epics (start_date);
CREATE INDEX idx_epics_end_date                          ON epics (end_date);
CREATE INDEX idx_epics_project_id                        ON epics (project_id);
CREATE INDEX idx_epics_created_by                        ON epics (created_by);
CREATE INDEX idx_epics_deleted_at                        ON epics (deleted_at);
CREATE INDEX idx_sprints_status                          ON sprints (status);
CREATE INDEX idx_sprints_project_id                      ON sprints (project_id);
CREATE INDEX idx_sprints_sprint_number                   ON sprints (sprint_number);
CREATE INDEX idx_sprints_start_date                      ON sprints (start_date);
CREATE INDEX idx_sprints_end_date                        ON sprints (end_date);
CREATE INDEX idx_sprints_created_by                      ON sprints (created_by);
CREATE INDEX idx_sprints_deleted_at                      ON sprints (deleted_at);
CREATE INDEX idx_user_stories_status                     ON user_stories (status);
CREATE INDEX idx_user_stories_assignee                   ON user_stories (assignee);
CREATE INDEX idx_user_stories_due_date                   ON user_stories (due_date);
CREATE INDEX idx_user_stories_project_id                 ON user_stories (project_id);
CREATE INDEX idx_user_stories_epic_id                    ON user_stories (epic_id);
CREATE INDEX idx_user_stories_sprint_id                  ON user_stories (sprint_id);
CREATE INDEX idx_user_stories_created_by                 ON user_stories (created_by);
CREATE INDEX idx_user_stories_deleted_at                 ON user_stories (deleted_at);
CREATE INDEX idx_code_repositories_type                  ON code_repositories (repository_type);
CREATE INDEX idx_user_story_code_repositories_story      ON user_story_code_repositories (user_story_id);
CREATE INDEX idx_user_story_code_repositories_repo       ON user_story_code_repositories (code_repository_id);
CREATE INDEX idx_workflow_statuses_project               ON workflow_statuses (project_id);
CREATE INDEX idx_workflow_transitions_project            ON workflow_transitions (project_id);
CREATE INDEX idx_workflow_transitions_from               ON workflow_transitions (from_status_id);
CREATE INDEX idx_workflow_transitions_to                 ON workflow_transitions (to_status_id);

-- ─── COMMENTS ─────────────────────────────────────────────────
COMMENT ON TABLE users                        IS 'User accounts with roles';
COMMENT ON TABLE refresh_tokens               IS 'Hashed refresh tokens for JWT authentication with token rotation';
COMMENT ON TABLE projects                     IS 'Workspace containers for epics, sprints and user stories';
COMMENT ON TABLE project_users                IS 'Many-to-many: project members';
COMMENT ON TABLE epics                        IS 'High-level roadmap items spanning multiple sprints';
COMMENT ON TABLE sprints                      IS 'Time-boxed iterations within a project';
COMMENT ON TABLE user_stories                 IS 'Backlog items; status driven by per-project workflow_statuses';
COMMENT ON TABLE code_repositories            IS 'GitLab/GitHub repositories linked to user stories';
COMMENT ON TABLE user_story_code_repositories IS 'Many-to-many: user story to code repository';
COMMENT ON TABLE workflow_statuses            IS 'Per-project workflow status definitions';
COMMENT ON TABLE workflow_transitions         IS 'Allowed status transitions per project';

COMMENT ON COLUMN users.role                         IS 'superadmin or dev';
COMMENT ON COLUMN refresh_tokens.token_hash          IS 'SHA-256 hash of the raw refresh token — never store the raw token';
COMMENT ON COLUMN refresh_tokens.expires_at          IS 'Token expiration (7 days from creation)';
COMMENT ON COLUMN refresh_tokens.revoked_at          IS 'Set when token is rotated or explicitly revoked via logout';
COMMENT ON COLUMN projects.status                    IS 'active | archived | on_hold';
COMMENT ON COLUMN epics.status                       IS 'planned | in_progress | completed | cancelled';
COMMENT ON COLUMN epics.is_visible_in_roadmap        IS 'Whether this epic appears in the roadmap view';
COMMENT ON COLUMN sprints.status                     IS 'planned | active | completed | cancelled';
COMMENT ON COLUMN user_stories.status                IS 'Free-form status key driven by workflow_statuses (e.g. to_specify, in_progress, dev_done, in_production, cancelled)';
COMMENT ON COLUMN user_stories.priority              IS 'low | medium | high | urgent';
COMMENT ON COLUMN user_stories.project_id            IS 'Direct project link (backfilled from epic or sprint when null)';
COMMENT ON COLUMN code_repositories.repository_type  IS 'gitlab or github';
COMMENT ON COLUMN code_repositories.repository_id    IS 'External repository ID from the GitLab/GitHub API';
COMMENT ON COLUMN workflow_statuses.key              IS 'Machine-readable identifier, e.g. to_specify, in_progress, dev_done';
COMMENT ON COLUMN workflow_statuses.group_names      IS 'Phase groups: SPECIFICATION | DEVELOPMENT | QA | DEPLOYMENT. A status can belong to multiple groups.';
COMMENT ON COLUMN workflow_statuses.is_initial       IS 'New user stories start with this status';
COMMENT ON COLUMN workflow_statuses.is_terminal      IS 'This status is a final/end state';
