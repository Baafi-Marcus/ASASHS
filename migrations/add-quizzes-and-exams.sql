-- Table for School Settings (API Keys, etc.)
CREATE TABLE IF NOT EXISTS school_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for eLearning Quizzes
CREATE TABLE IF NOT EXISTS elearning_quizzes (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    time_limit INTEGER DEFAULT 30, -- in minutes
    passing_score INTEGER DEFAULT 50, -- in percentage
    total_points DECIMAL(10,2) DEFAULT 0,
    shuffle_questions BOOLEAN DEFAULT false,
    shuffle_options BOOLEAN DEFAULT false,
    show_results_immediately BOOLEAN DEFAULT true,
    display_mode VARCHAR(20) DEFAULT 'all_at_once',
    allow_late_grading BOOLEAN DEFAULT false,
    due_date TIMESTAMP,
    duration_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES elearning_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- 'mcq', 'tf', 'fill_in'
    points DECIMAL(5,2) DEFAULT 1.00,
    order_index INTEGER DEFAULT 0,
    group_id INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Quiz Options (for MCQ/TF)
CREATE TABLE IF NOT EXISTS quiz_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false
);

-- Table for Quiz Correct Answers (for Fill-In, allows multiple variations)
CREATE TABLE IF NOT EXISTS quiz_correct_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL -- e.g., "8", "eight"
);

-- Table for Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES elearning_quizzes(id) ON DELETE CASCADE,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    score DECIMAL(10,2) DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'in-progress', -- 'in-progress', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Quiz Responses (Student's answers)
CREATE TABLE IF NOT EXISTS quiz_responses (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
    response_text TEXT,
    is_correct BOOLEAN DEFAULT false,
    points_earned DECIMAL(10,2) DEFAULT 0
);

-- Initial settings
INSERT INTO school_settings (setting_key, setting_value) 
VALUES ('github_model_api_key', '')
ON CONFLICT (setting_key) DO NOTHING;
