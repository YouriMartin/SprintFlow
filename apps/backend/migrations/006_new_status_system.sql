-- ============================================================
-- Migration 006: New 17-status lifecycle system
-- Replaces the 14-status system with 4 phase groups:
--   SPECIFICATION | DEVELOPMENT | QA | DEPLOYMENT | (TERMINAL)
--
-- ORDER MATTERS:
--   1. Drop old constraint first (so UPDATEs to new values are allowed)
--   2. Migrate existing data
--   3. Add new constraint
-- ============================================================

-- Step 1: Drop the old status check constraint
ALTER TABLE user_stories
    DROP CONSTRAINT IF EXISTS user_stories_status_check;

-- Step 2: Migrate existing data to new status values

-- Specification group
UPDATE user_stories SET status = 'to_specify'  WHERE status IN ('draft', 'on_hold', 'blocked');
UPDATE user_stories SET status = 'writing'     WHERE status = 'analysis';
UPDATE user_stories SET status = 'to_validate' WHERE status = 'acceptance';
UPDATE user_stories SET status = 'ready'       WHERE status = 'ready_for_dev';

-- Development group (in_progress and code_review keep their values)
-- 'testing' was previously a dev status, move to QA queue
UPDATE user_stories SET status = 'to_test'        WHERE status = 'testing';

-- Deployment group
UPDATE user_stories SET status = 'to_deploy'      WHERE status = 'ready_to_deploy';
-- staging keeps its value
UPDATE user_stories SET status = 'in_production'  WHERE status IN ('deployed', 'done');

-- Terminal (cancelled keeps its value)

-- Step 3: Add new constraint for the 17 status values
ALTER TABLE user_stories
    ADD CONSTRAINT user_stories_status_check
        CHECK (status IN (
            -- SPECIFICATION
            'to_specify', 'writing', 'to_validate', 'ready',
            -- DEVELOPMENT
            'todo', 'in_progress', 'code_review', 'dev_done',
            -- QA / RECETTE
            'to_test', 'testing', 'test_passed', 'test_failed',
            -- DEPLOYMENT
            'to_deploy', 'staging', 'pre_prod', 'in_production',
            -- TERMINAL
            'cancelled'
        ));

-- Step 4: Update column comment
COMMENT ON COLUMN user_stories.status IS
    'User story status — SPECIFICATION: to_specify, writing, to_validate, ready | DEVELOPMENT: todo, in_progress, code_review, dev_done | QA: to_test, testing, test_passed, test_failed | DEPLOYMENT: to_deploy, staging, pre_prod, in_production | TERMINAL: cancelled';
