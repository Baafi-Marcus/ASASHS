-- Migration script to add semester field to classes table
-- This script adds the semester column to support the new semester-based academic system

-- Add semester column to classes table
ALTER TABLE classes ADD COLUMN semester INTEGER DEFAULT 1 CHECK (semester IN (1, 2));

-- Update existing classes to have semester 1 (since they were all created as semester 1)
UPDATE classes SET semester = 1 WHERE semester IS NULL;

-- Update class names to include semester information
-- This will help distinguish between semester 1 and semester 2 classes
UPDATE classes 
SET class_name = class_name || ' S1' 
WHERE semester = 1 AND class_name NOT LIKE '%S1' AND class_name NOT LIKE '%S2';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_semester ON classes(semester);
CREATE INDEX IF NOT EXISTS idx_classes_course_form_semester ON classes(course_id, form, semester);

COMMIT;