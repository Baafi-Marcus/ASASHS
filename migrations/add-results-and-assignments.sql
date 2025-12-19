-- Add tables for student results and assignments

-- Table for assignment types (classwork, homework, project, etc.)
CREATE TABLE assignment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- classwork, homework, project, exam, midsem_exam
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default assignment types
INSERT INTO assignment_types (name, description) VALUES 
('Classwork', 'In-class assignments'),
('Homework', 'Take-home assignments'),
('Project', 'Student projects'),
('Class Test', 'Class tests'),
('Midsem Exam', 'Mid-semester examinations'),
('Exam', 'End-of-semester examinations');

-- Table for assignments
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignment_type_id INTEGER REFERENCES assignment_types(id),
    due_date DATE,
    max_score DECIMAL(5,2) DEFAULT 100.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for student assignment submissions
CREATE TABLE assignment_submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500), -- Path to uploaded file
    score DECIMAL(5,2),
    remarks TEXT,
    graded_by INTEGER REFERENCES teachers(id), -- Teacher who graded
    graded_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for student results
CREATE TABLE student_results (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    academic_year VARCHAR(9) NOT NULL, -- 2025/2026
    term INTEGER NOT NULL CHECK (term IN (1, 2, 3)), -- 1st, 2nd, 3rd term
    class_score DECIMAL(5,2), -- 30% for class work
    exam_score DECIMAL(5,2), -- 70% for exams
    total_score DECIMAL(5,2), -- class_score + exam_score
    grade VARCHAR(2), -- A1, B2, C3, etc.
    remarks TEXT, -- Teacher's remarks
    is_final BOOLEAN DEFAULT false, -- Whether this is the final result for the term
    approved_by INTEGER REFERENCES teachers(id), -- Teacher who approved the result
    approved_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id, academic_year, term)
);

-- Table for teacher messages/announcements to students
CREATE TABLE teacher_messages (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false, -- Private message to specific students
    recipient_student_id INTEGER REFERENCES students(id) ON DELETE CASCADE, -- For private messages
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX idx_assignments_class_id ON assignments(class_id);
CREATE INDEX idx_assignments_subject_id ON assignments(subject_id);
CREATE INDEX idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX idx_student_results_student_id ON student_results(student_id);
CREATE INDEX idx_student_results_subject_id ON student_results(subject_id);
CREATE INDEX idx_student_results_academic_year ON student_results(academic_year);
CREATE INDEX idx_student_results_term ON student_results(term);
CREATE INDEX idx_teacher_messages_teacher_id ON teacher_messages(teacher_id);
CREATE INDEX idx_teacher_messages_class_id ON teacher_messages(class_id);