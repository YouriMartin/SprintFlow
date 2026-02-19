-- Add is_visible_in_roadmap column to epics table
-- This column controls whether an epic appears on the roadmap view

ALTER TABLE epics
    ADD COLUMN IF NOT EXISTS is_visible_in_roadmap BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN epics.is_visible_in_roadmap IS 'Whether this epic is visible in the roadmap view';
