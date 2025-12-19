-- Complete migration script for semester-based academic system
-- This script adds semester support to the existing database

-- Add semester column to classes table
ALTER TABLE classes ADD COLUMN IF NOT EXISTS semester INTEGER DEFAULT 1 CHECK (semester IN (1, 2));

-- Update existing classes to have semester 1 (since they were all created as semester 1)
UPDATE classes SET semester = 1 WHERE semester IS NULL;

-- Update class names to include semester information for existing classes
UPDATE classes 
SET class_name = class_name || ' S1' 
WHERE semester = 1 AND class_name NOT LIKE '%S1' AND class_name NOT LIKE '%S2';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_semester ON classes(semester);
CREATE INDEX IF NOT EXISTS idx_classes_course_form_semester ON classes(course_id, form, semester);

-- Update the sample data to include semester information
-- Note: This is for reference only, as the sample data is in the schema file

COMMIT;