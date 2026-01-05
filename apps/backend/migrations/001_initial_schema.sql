-- Initial database schema for SprintFlow
-- This script creates the tables for tasks, projects, and their relationships

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('todo', 'in_progress', 'done')),
  priority VARCHAR(50) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee VARCHAR(255),
  due_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

-- Task-CodeRepository junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS task_code_repositories (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  code_repository_id UUID NOT NULL REFERENCES code_repositories(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (task_id, code_repository_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_code_repositories_repository_type ON code_repositories(repository_type);
CREATE INDEX IF NOT EXISTS idx_task_code_repositories_task_id ON task_code_repositories(task_id);
CREATE INDEX IF NOT EXISTS idx_task_code_repositories_code_repository_id ON task_code_repositories(code_repository_id);

-- Comments for documentation
COMMENT ON TABLE tasks IS 'Stores task information for sprint planning';
COMMENT ON TABLE code_repositories IS 'Stores code repository information linked to Git repositories (GitLab/GitHub)';
COMMENT ON TABLE task_code_repositories IS 'Many-to-many relationship between tasks and code repositories';

COMMENT ON COLUMN tasks.status IS 'Task status: todo, in_progress, or done';
COMMENT ON COLUMN tasks.priority IS 'Task priority: low, medium, high, or urgent';
COMMENT ON COLUMN code_repositories.repository_type IS 'Type of Git repository: gitlab or github';
COMMENT ON COLUMN code_repositories.repository_id IS 'External repository ID from GitLab/GitHub API';
