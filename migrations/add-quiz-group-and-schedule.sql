-- Add group_id for follow-up questions (questions with same group_id stay together when shuffled)
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS group_id INTEGER DEFAULT 0;

-- Add scheduling columns to elearning_quizzes for fixed start/end times
ALTER TABLE elearning_quizzes ADD COLUMN IF NOT EXISTS due_date TIMESTAMP;
ALTER TABLE elearning_quizzes ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
