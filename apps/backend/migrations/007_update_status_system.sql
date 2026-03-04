-- ============================================================
-- Migration 007: Replace QA status group with per-stage testing
--
-- Changes:
--   REMOVE: to_test, testing, test_passed
--   ADD:    testing_staging, testing_pre_prod, testing_prod
--   KEEP:   test_failed (now cross-cutting: dev, deployment & QA views)
--
-- New DEPLOYMENT flow:
--   to_deploy → staging → testing_staging
--               → pre_prod → testing_pre_prod
--               → testing_prod → in_production
--
-- ORDER MATTERS:
--   1. Drop old constraint (allows UPDATEs to new values)
--   2. Migrate existing data
--   3. Add new constraint
-- ============================================================

-- Step 1: Drop the existing status check constraint
ALTER TABLE user_stories
    DROP CONSTRAINT IF EXISTS user_stories_status_check;

-- Step 2: Migrate existing QA statuses to closest equivalents
-- to_test / testing → testing_staging (earliest testing stage)
UPDATE user_stories SET status = 'testing_staging' WHERE status IN ('to_test', 'testing');
-- test_passed → to_deploy (ready for deployment pipeline)
UPDATE user_stories SET status = 'to_deploy' WHERE status = 'test_passed';
-- test_failed stays as test_failed (value unchanged, now cross-cutting)

-- Step 3: Add new constraint with updated status list
ALTER TABLE user_stories
    ADD CONSTRAINT user_stories_status_check
        CHECK (status IN (
            -- SPECIFICATION
            'to_specify', 'writing', 'to_validate', 'ready',
            -- DEVELOPMENT
            'todo', 'in_progress', 'code_review', 'dev_done',
            -- DEPLOYMENT (incl. per-stage testing)
            'to_deploy', 'staging', 'testing_staging',
            'pre_prod', 'testing_pre_prod',
            'testing_prod', 'in_production',
            -- CROSS-CUTTING
            'test_failed',
            -- TERMINAL
            'cancelled'
        ));

-- Step 4: Update column comment
COMMENT ON COLUMN user_stories.status IS
    'User story status — SPECIFICATION: to_specify, writing, to_validate, ready | DEVELOPMENT: todo, in_progress, code_review, dev_done | DEPLOYMENT: to_deploy, staging, testing_staging, pre_prod, testing_pre_prod, testing_prod, in_production | CROSS-CUTTING: test_failed | TERMINAL: cancelled';
