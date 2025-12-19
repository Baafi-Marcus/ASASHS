-- Migration script to add detailed timetable entries table
-- This table will store individual timetable entries for better querying and filtering

-- Create timetable_entries table
CREATE TABLE IF NOT EXISTS timetable_entries (
    id SERIAL PRIMARY KEY,
    day VARCHAR(10) NOT NULL, -- Mon, Tue, Wed, etc.
    time_slot VARCHAR(20) NOT NULL, -- 8-9 AM, 9-10 AM, etc.
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    academic_year VARCHAR(9) NOT NULL, -- 2025/2026
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timetable_entries_day ON timetable_entries(day);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_class_id ON timetable_entries(class_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_subject_id ON timetable_entries(subject_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_teacher_id ON timetable_entries(teacher_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_academic_year ON timetable_entries(academic_year);

COMMIT;