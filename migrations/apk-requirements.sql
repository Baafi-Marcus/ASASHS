-- Add new columns for APK and assessment hierarchy features
ALTER TABLE elearning_quizzes ADD COLUMN IF NOT EXISTS creator_role VARCHAR(20) DEFAULT 'teacher';
ALTER TABLE elearning_quizzes ADD COLUMN IF NOT EXISTS assessment_category VARCHAR(20) DEFAULT 'quiz';
ALTER TABLE elearning_quizzes ADD COLUMN IF NOT EXISTS assessment_format VARCHAR(20) DEFAULT 'objective_only';
ALTER TABLE elearning_quizzes ADD COLUMN IF NOT EXISTS sync_to_gradebook BOOLEAN DEFAULT false;
ALTER TABLE elearning_quizzes ADD COLUMN IF NOT EXISTS allow_offline BOOLEAN DEFAULT true;

-- Ensure school_settings exists
CREATE TABLE IF NOT EXISTS school_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default grading weights
INSERT INTO school_settings (setting_key, setting_value) VALUES ('class_score_weight', '30') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO school_settings (setting_key, setting_value) VALUES ('exam_score_weight', '70') ON CONFLICT (setting_key) DO NOTHING;
