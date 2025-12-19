-- Script to delete all classes and clean up related data
-- This removes all demo classes and prepares the database for new class creation

-- Step 1: Update students to remove class assignments
UPDATE students SET current_class_id = NULL WHERE current_class_id IS NOT NULL;

-- Step 2: Delete all teacher-subject-class relationships
DELETE FROM teacher_subjects;

-- Step 3: Delete all classes
DELETE FROM classes;

-- Verification queries (run these to confirm deletion)
-- SELECT COUNT(*) as remaining_classes FROM classes;
-- SELECT COUNT(*) as students_without_class FROM students WHERE current_class_id IS NULL;
-- SELECT COUNT(*) as remaining_teacher_assignments FROM teacher_subjects;

-- Reset the sequence for classes (optional - for clean ID numbering)
-- ALTER SEQUENCE classes_id_seq RESTART WITH 1;

COMMIT;