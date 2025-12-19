-- Add table for student behavior records

-- Table for student behavior records
CREATE TABLE student_behavior_records (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    recorded_by INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Commendation', 'Warning', 'Disciplinary')),
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Noted')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_student_behavior_records_student_id ON student_behavior_records(student_id);
CREATE INDEX idx_student_behavior_records_date ON student_behavior_records(date);