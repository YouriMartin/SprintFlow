-- Migrate existing 'todo' records to the new 'draft' status
UPDATE user_stories
SET status = 'draft'
WHERE status = 'todo';

-- Drop the old status check constraint (auto-named by PostgreSQL)
ALTER TABLE user_stories
    DROP CONSTRAINT IF EXISTS user_stories_status_check;

-- Add new constraint with all 14 status values
ALTER TABLE user_stories
    ADD CONSTRAINT user_stories_status_check
        CHECK (status IN (
            'draft', 'analysis', 'ready_for_dev', 'acceptance',
            'in_progress', 'code_review', 'testing',
            'ready_to_deploy', 'staging', 'deployed', 'done',
            'on_hold', 'blocked', 'cancelled'
            ));

-- Update column comment
COMMENT ON COLUMN user_stories.status IS
    'User story status — Functional: draft, analysis, ready_for_dev, acceptance | Development: in_progress, code_review, testing | Deployment: ready_to_deploy, staging, deployed, done | Transversal: on_hold, blocked, cancelled';
