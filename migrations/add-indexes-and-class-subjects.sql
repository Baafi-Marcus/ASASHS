-- Migration script to add indexes and ensure class_subjects table exists
-- This script should be run to optimize database performance and ensure proper relationships

-- Create class_subjects table if it doesn't exist
CREATE TABLE IF NOT EXISTS class_subjects (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    is_elective BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, subject_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_current_class_id ON students(current_class_id);
CREATE INDEX IF NOT EXISTS idx_classes_form ON classes(form);
CREATE INDEX IF NOT EXISTS idx_class_subjects_class_id ON class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_subject_id ON class_subjects(subject_id);

-- Ensure the class_subjects table has data for existing classes
-- This will populate the class_subjects table with existing class-subject relationships
-- Note: This is a sample query - you may need to adjust based on your actual data structure
/*
INSERT INTO class_subjects (class_id, subject_id, is_elective)
SELECT c.id, s.id, true
FROM classes c
JOIN subjects s ON s.course_id = c.course_id
WHERE s.is_core = false
ON CONFLICT DO NOTHING;
*/

COMMIT;