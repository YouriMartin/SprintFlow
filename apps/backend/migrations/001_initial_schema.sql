-- Initial database schema for SprintFlow
-- This script creates the tables for users, projects, epics, user stories, code repositories, and their relationships

-- Users table
CREATE TABLE IF NOT EXISTS users
(
    id
    UUID
    PRIMARY
    KEY,
    email
    VARCHAR
(
    255
) NOT NULL UNIQUE,
    name VARCHAR
(
    255
) NOT NULL,
    password VARCHAR
(
    255
) NOT NULL,
    role VARCHAR
(
    50
) NOT NULL CHECK
(
    role
    IN
(
    'superadmin',
    'dev'
)),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

-- Projects table
CREATE TABLE IF NOT EXISTS projects
(
    id
    UUID
    PRIMARY
    KEY,
    name
    VARCHAR
(
    255
) NOT NULL,
    description TEXT,
    status VARCHAR
(
    50
) NOT NULL CHECK
(
    status
    IN
(
    'active',
    'archived',
    'on_hold'
)),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

-- Project-User junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS project_users
(
    project_id
    UUID
    NOT
    NULL
    REFERENCES
    projects
(
    id
) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users
(
    id
)
  ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY
(
    project_id,
    user_id
)
    );

-- Epics table
CREATE TABLE IF NOT EXISTS epics
(
    id
    UUID
    PRIMARY
    KEY,
    title
    VARCHAR
(
    255
) NOT NULL,
    description TEXT,
    status VARCHAR
(
    50
) NOT NULL CHECK
(
    status
    IN
(
    'planned',
    'in_progress',
    'completed',
    'cancelled'
)),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    project_id UUID REFERENCES projects
(
    id
) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users
(
    id
) ON DELETE RESTRICT,
    updated_by UUID REFERENCES users
(
    id
) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users
(
    id
) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
    );

-- User Stories table
CREATE TABLE IF NOT EXISTS user_stories
(
    id
    UUID
    PRIMARY
    KEY,
    title
    VARCHAR
(
    255
) NOT NULL,
    description TEXT,
    status VARCHAR
(
    50
) NOT NULL CHECK
(
    status
    IN
(
    'todo',
    'in_progress',
    'done'
)),
    priority VARCHAR
(
    50
) NOT NULL CHECK
(
    priority
    IN
(
    'low',
    'medium',
    'high',
    'urgent'
)),
    assignee VARCHAR
(
    255
),
    due_date TIMESTAMP,
    epic_id UUID REFERENCES epics
(
    id
) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users
(
    id
) ON DELETE RESTRICT,
    updated_by UUID REFERENCES users
(
    id
) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users
(
    id
) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Code Repositories table
CREATE TABLE IF NOT EXISTS code_repositories (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  repository_url VARCHAR(500) NOT NULL,
  repository_type VARCHAR(50) NOT NULL CHECK (repository_type IN ('gitlab', 'github')),
  repository_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- UserStory-CodeRepository junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_story_code_repositories
(
    user_story_id
    UUID
    NOT
    NULL
    REFERENCES
    user_stories
(
    id
) ON DELETE CASCADE,
  code_repository_id UUID NOT NULL REFERENCES code_repositories(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY
(
    user_story_id,
    code_repository_id
)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_project_users_project_id ON project_users (project_id);
CREATE INDEX IF NOT EXISTS idx_project_users_user_id ON project_users (user_id);
CREATE INDEX IF NOT EXISTS idx_epics_status ON epics (status);
CREATE INDEX IF NOT EXISTS idx_epics_start_date ON epics (start_date);
CREATE INDEX IF NOT EXISTS idx_epics_end_date ON epics (end_date);
CREATE INDEX IF NOT EXISTS idx_epics_project_id ON epics (project_id);
CREATE INDEX IF NOT EXISTS idx_epics_created_by ON epics (created_by);
CREATE INDEX IF NOT EXISTS idx_epics_deleted_at ON epics (deleted_at);
CREATE INDEX IF NOT EXISTS idx_user_stories_status ON user_stories (status);
CREATE INDEX IF NOT EXISTS idx_user_stories_assignee ON user_stories (assignee);
CREATE INDEX IF NOT EXISTS idx_user_stories_due_date ON user_stories (due_date);
CREATE INDEX IF NOT EXISTS idx_user_stories_epic_id ON user_stories (epic_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_created_by ON user_stories (created_by);
CREATE INDEX IF NOT EXISTS idx_user_stories_deleted_at ON user_stories (deleted_at);
CREATE INDEX IF NOT EXISTS idx_code_repositories_repository_type ON code_repositories (repository_type);
CREATE INDEX IF NOT EXISTS idx_user_story_code_repositories_user_story_id ON user_story_code_repositories (user_story_id);
CREATE INDEX IF NOT EXISTS idx_user_story_code_repositories_code_repository_id ON user_story_code_repositories (code_repository_id);

-- Comments for documentation
COMMENT
ON TABLE users IS 'Stores user information with roles';
COMMENT
ON TABLE projects IS 'Stores project information (workspaces containing epics)';
COMMENT
ON TABLE project_users IS 'Many-to-many relationship between projects and users';
COMMENT
ON TABLE epics IS 'Stores epic information for roadmap planning';
COMMENT
ON TABLE user_stories IS 'Stores user story information for sprint planning and product backlog';
COMMENT ON TABLE code_repositories IS 'Stores code repository information linked to Git repositories (GitLab/GitHub)';
COMMENT
ON TABLE user_story_code_repositories IS 'Many-to-many relationship between user stories and code repositories';

COMMENT
ON COLUMN users.role IS 'User role: superadmin or dev';
COMMENT
ON COLUMN projects.status IS 'Project status: active, archived, or on_hold';
COMMENT
ON COLUMN epics.status IS 'Epic status: planned, in_progress, completed, or cancelled';
COMMENT
ON COLUMN epics.start_date IS 'Start date of the epic for roadmap visualization (required)';
COMMENT
ON COLUMN epics.end_date IS 'End date of the epic for roadmap visualization (required)';
COMMENT
ON COLUMN epics.project_id IS 'Foreign key to the project this epic belongs to';
COMMENT
ON COLUMN epics.created_by IS 'User who created this epic';
COMMENT
ON COLUMN epics.updated_by IS 'User who last updated this epic';
COMMENT
ON COLUMN epics.deleted_by IS 'User who deleted this epic (soft delete)';
COMMENT
ON COLUMN epics.deleted_at IS 'Timestamp when this epic was deleted (soft delete)';
COMMENT
ON COLUMN user_stories.status IS 'User story status: todo, in_progress, or done';
COMMENT
ON COLUMN user_stories.priority IS 'User story priority: low, medium, high, or urgent';
COMMENT
ON COLUMN user_stories.epic_id IS 'Foreign key to the epic this user story belongs to';
COMMENT
ON COLUMN user_stories.created_by IS 'User who created this user story';
COMMENT
ON COLUMN user_stories.updated_by IS 'User who last updated this user story';
COMMENT
ON COLUMN user_stories.deleted_by IS 'User who deleted this user story (soft delete)';
COMMENT
ON COLUMN user_stories.deleted_at IS 'Timestamp when this user story was deleted (soft delete)';
COMMENT ON COLUMN code_repositories.repository_type IS 'Type of Git repository: gitlab or github';
COMMENT ON COLUMN code_repositories.repository_id IS 'External repository ID from GitLab/GitHub API';
