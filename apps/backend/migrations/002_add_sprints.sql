-- Migration: Add sprints table and sprint_id to user_stories
-- This script creates the sprints table for sprint management

-- Sprints table
CREATE TABLE IF NOT EXISTS sprints
(
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    sprint_number INTEGER NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
    velocity INTEGER,
    capacity INTEGER,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Add sprint_id column to user_stories table
ALTER TABLE user_stories ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL;

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints (status);
CREATE INDEX IF NOT EXISTS idx_sprints_project_id ON sprints (project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_sprint_number ON sprints (sprint_number);
CREATE INDEX IF NOT EXISTS idx_sprints_start_date ON sprints (start_date);
CREATE INDEX IF NOT EXISTS idx_sprints_end_date ON sprints (end_date);
CREATE INDEX IF NOT EXISTS idx_sprints_created_by ON sprints (created_by);
CREATE INDEX IF NOT EXISTS idx_sprints_deleted_at ON sprints (deleted_at);
CREATE INDEX IF NOT EXISTS idx_user_stories_sprint_id ON user_stories (sprint_id);

-- Comments for documentation
COMMENT ON TABLE sprints IS 'Stores sprint information for agile sprint planning';
COMMENT ON COLUMN sprints.name IS 'Name of the sprint (e.g., Sprint 1, Sprint 2)';
COMMENT ON COLUMN sprints.goal IS 'Sprint goal describing what the team aims to achieve';
COMMENT ON COLUMN sprints.sprint_number IS 'Sequential number of the sprint within the project';
COMMENT ON COLUMN sprints.start_date IS 'Start date of the sprint';
COMMENT ON COLUMN sprints.end_date IS 'End date of the sprint';
COMMENT ON COLUMN sprints.status IS 'Sprint status: planned, active, completed, or cancelled';
COMMENT ON COLUMN sprints.velocity IS 'Actual velocity achieved in the sprint (story points completed)';
COMMENT ON COLUMN sprints.capacity IS 'Planned capacity for the sprint (story points)';
COMMENT ON COLUMN sprints.project_id IS 'Foreign key to the project this sprint belongs to';
COMMENT ON COLUMN sprints.created_by IS 'User who created this sprint';
COMMENT ON COLUMN sprints.updated_by IS 'User who last updated this sprint';
COMMENT ON COLUMN sprints.deleted_by IS 'User who deleted this sprint (soft delete)';
COMMENT ON COLUMN sprints.deleted_at IS 'Timestamp when this sprint was deleted (soft delete)';
COMMENT ON COLUMN user_stories.sprint_id IS 'Foreign key to the sprint this user story is assigned to';
