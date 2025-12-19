-- Migration script to add class_id column to announcements table
-- This script should be run on existing databases to update the schema

-- Add class_id column to announcements table
ALTER TABLE announcements 
ADD COLUMN class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE;

-- Add comment to explain the purpose of the new column
COMMENT ON COLUMN announcements.class_id IS 'Optional class ID for class-specific announcements. NULL for school-wide announcements.';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_class_id ON announcements(class_id);