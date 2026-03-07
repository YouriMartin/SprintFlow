-- Migration 008: Workflow statuses and transitions per project

-- 1. workflow_statuses per project
CREATE TABLE workflow_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  key VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  group_names TEXT[] NOT NULL DEFAULT '{}',   -- e.g. '{SPECIFICATION}' or '{DEVELOPMENT,DEPLOYMENT}'
  sort_order INTEGER NOT NULL DEFAULT 0,
  color VARCHAR(20) NOT NULL DEFAULT '#6b7280',
  is_initial BOOLEAN NOT NULL DEFAULT false,
  is_terminal BOOLEAN NOT NULL DEFAULT false,
  pos_x FLOAT NOT NULL DEFAULT 0,
  pos_y FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, key)
);

-- 2. workflow_transitions per project
CREATE TABLE workflow_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_status_id UUID NOT NULL REFERENCES workflow_statuses(id) ON DELETE CASCADE,
  to_status_id UUID NOT NULL REFERENCES workflow_statuses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(from_status_id, to_status_id)
);

-- 3. Add project_id to user_stories (if not already present)
ALTER TABLE user_stories ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);

-- 4. Backfill project_id from epic or sprint
UPDATE user_stories us
SET project_id = COALESCE(
  (SELECT e.project_id FROM epics e WHERE e.id = us.epic_id AND e.deleted_at IS NULL),
  (SELECT s.project_id FROM sprints s WHERE s.id = us.sprint_id AND s.deleted_at IS NULL)
)
WHERE us.project_id IS NULL AND us.deleted_at IS NULL;

-- 5. Remove old CHECK constraint (status becomes a free VARCHAR)
ALTER TABLE user_stories DROP CONSTRAINT IF EXISTS user_stories_status_check;

-- 6. Indexes
CREATE INDEX idx_workflow_statuses_project ON workflow_statuses(project_id);
CREATE INDEX idx_workflow_transitions_project ON workflow_transitions(project_id);
CREATE INDEX idx_workflow_transitions_from ON workflow_transitions(from_status_id);
CREATE INDEX idx_workflow_transitions_to ON workflow_transitions(to_status_id);
CREATE INDEX idx_user_stories_project ON user_stories(project_id);

COMMENT ON TABLE workflow_statuses IS 'Per-project workflow status definitions';
COMMENT ON TABLE workflow_transitions IS 'Allowed status transitions per project';
COMMENT ON COLUMN workflow_statuses.key IS 'Machine-readable key, e.g. to_specify, in_progress';
COMMENT ON COLUMN workflow_statuses.group_names IS 'Phase groups this status belongs to: SPECIFICATION, DEVELOPMENT, DEPLOYMENT. A status can appear in multiple views.';
COMMENT ON COLUMN workflow_statuses.is_initial IS 'Whether new stories start with this status';
COMMENT ON COLUMN workflow_statuses.is_terminal IS 'Whether this status is a final/end state';
