-- Add all known missing columns to quiz_attempts
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS end_time TIMESTAMP;
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS tab_switches INTEGER DEFAULT 0;
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS submission_type VARCHAR(50) DEFAULT 'auto';
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS points DECIMAL(10,2) DEFAULT 0;
