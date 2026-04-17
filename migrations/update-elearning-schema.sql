-- Add instructions to quizzes
ALTER TABLE elearning_quizzes ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Update assignments for submissions
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS submission_type VARCHAR(20) DEFAULT 'none';
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS points DECIMAL(5,2) DEFAULT 0;

-- Track cheating attempts
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS tab_switches INTEGER DEFAULT 0;
