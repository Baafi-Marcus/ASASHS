-- ASASHS Database Schema with Multi-User Authentication
-- Updated for student/teacher login system with courses and subjects

-- Drop existing tables if they exist
DROP TABLE IF EXISTS timetables CASCADE;
DROP TABLE IF EXISTS student_subjects CASCADE;
DROP TABLE IF EXISTS teacher_subjects CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS teacher_assignments CASCADE;
DROP TABLE IF EXISTS teacher_qualifications CASCADE;
DROP TABLE IF EXISTS student_enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS programmes CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table for authentication (Admin, Students, Teachers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(20) UNIQUE NOT NULL, -- ADMIN001, STU2025001, TEA2025001
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('admin', 'student', 'teacher')),
    password_hash VARCHAR(255) NOT NULL,
    temp_password VARCHAR(20), -- For first-time login
    must_change_password BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table (replaces programmes)
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    duration_years INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    course_id INTEGER REFERENCES courses(id),
    is_core BOOLEAN DEFAULT false, -- Core or elective subject
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    course_id INTEGER REFERENCES courses(id),
    form INTEGER NOT NULL CHECK (form BETWEEN 1 AND 3),
    semester INTEGER DEFAULT 1 CHECK (semester IN (1, 2)),
    stream VARCHAR(1), -- A, B, C, etc.
    academic_year VARCHAR(9) NOT NULL, -- 2025/2026
    capacity INTEGER DEFAULT 40,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(20) UNIQUE NOT NULL, -- STU2025001
    admission_number VARCHAR(20) UNIQUE NOT NULL, -- ASA2025001
    course_id INTEGER REFERENCES courses(id),
    current_class_id INTEGER REFERENCES classes(id),
    
    -- Personal Information
    surname VARCHAR(50) NOT NULL,
    other_names VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    nationality VARCHAR(50) DEFAULT 'Ghanaian',
    
    -- Location Information
    hometown VARCHAR(100),
    district_of_origin VARCHAR(100),
    region_of_origin VARCHAR(100),
    
    -- Guardian Information
    guardian_name VARCHAR(100) NOT NULL,
    guardian_relationship VARCHAR(50) DEFAULT 'Parent',
    guardian_phone VARCHAR(20) NOT NULL,
    guardian_phone_alt VARCHAR(20),
    guardian_email VARCHAR(100),
    guardian_address TEXT,
    
    -- Academic Information
    previous_school VARCHAR(200),
    graduation_year VARCHAR(4),
    enrollment_date DATE NOT NULL,
    
    -- Health Information
    known_allergies TEXT,
    chronic_conditions TEXT,
    blood_group VARCHAR(5),
    
    -- Residential Information
    residential_status VARCHAR(20) DEFAULT 'Day Student' CHECK (residential_status IN ('Day Student', 'Boarding Student')),
    house_preference VARCHAR(50),
    
    -- Status
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Graduated', 'Transferred')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teachers table
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    teacher_id VARCHAR(20) UNIQUE NOT NULL, -- TEA2025001
    staff_id VARCHAR(20) UNIQUE NOT NULL, -- STAFF001
    
    -- Personal Information
    title VARCHAR(10) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    other_names VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    nationality VARCHAR(50) DEFAULT 'Ghanaian',
    ghana_card_id VARCHAR(20),
    
    -- Professional Information
    employment_date DATE NOT NULL,
    department VARCHAR(100) NOT NULL,
    position_rank VARCHAR(100),
    staff_type VARCHAR(20) DEFAULT 'Permanent' CHECK (staff_type IN ('Permanent', 'Contract', 'National Service')),
    
    -- Contact Information
    personal_phone VARCHAR(20) NOT NULL,
    alt_phone VARCHAR(20),
    personal_email VARCHAR(100) NOT NULL,
    residential_address TEXT,
    
    -- Educational Background
    highest_qualification VARCHAR(100),
    field_of_study VARCHAR(100),
    institution VARCHAR(200),
    year_obtained VARCHAR(4),
    other_qualifications TEXT,
    
    -- Emergency Contact
    emergency_name VARCHAR(100),
    emergency_relationship VARCHAR(50),
    emergency_phone VARCHAR(20),
    
    -- Status
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Suspended', 'Terminated')),
    role VARCHAR(50) DEFAULT 'Teacher',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student-Subject relationship
CREATE TABLE student_subjects (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year VARCHAR(9) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id, academic_year)
);

-- Teacher-Subject relationship
CREATE TABLE teacher_subjects (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    academic_year VARCHAR(9) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, subject_id, class_id, academic_year)
);

-- Timetables table
CREATE TABLE timetables (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('pdf', 'excel')),
    academic_year VARCHAR(9) NOT NULL,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements table
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE, -- NULL for school-wide announcements
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timetable entries table (detailed timetable entries for better querying)
CREATE TABLE timetable_entries (
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

-- Insert default admin user
INSERT INTO users (user_id, user_type, password_hash, must_change_password, temp_password) VALUES 
('ADMIN001', 'admin', '$2b$10$eXqfszx/nIZ.a3QUesk31e1ZMJLxNparJazxP2EVQz/LgJTGURYlO', false, 'admin123');

-- Insert the 6 courses as specified
INSERT INTO courses (name, code, description) VALUES 
('General Art', 'GA', 'General Arts programme focusing on humanities and social sciences'),
('Business', 'BUS', 'Business programme covering accounting, economics, and management'),
('General Science', 'GS', 'General Science programme covering physics, chemistry, biology, and mathematics'),
('Visual Art', 'VA', 'Visual Arts programme focusing on creative and artistic studies'),
('General Agricultural', 'AGRIC', 'Agricultural programme covering crop production, animal husbandry, and agricultural technology'),
('Home Economics', 'HE', 'Home Economics programme covering nutrition, clothing, textiles, and management');

-- Insert core subjects for all courses
INSERT INTO subjects (name, code, course_id, is_core) VALUES 
-- Core subjects (same for all courses)
('English Language', 'ENG', NULL, true),
('Mathematics (Core)', 'MATH_C', NULL, true),
('Integrated Science', 'INT_SCI', NULL, true),
('Social Studies', 'SOC_STU', NULL, true),

-- General Art electives
('History', 'HIST', 1, false),
('Geography', 'GEOG', 1, false),
('Government', 'GOV', 1, false),
('Economics', 'ECON', 1, false),
('Literature in English', 'LIT', 1, false),

-- Business electives
('Economics', 'ECON_BUS', 2, false),
('Business Management', 'BUS_MGT', 2, false),
('Financial Accounting', 'FIN_ACC', 2, false),
('Cost Accounting', 'COST_ACC', 2, false),

-- General Science electives
('Physics', 'PHYS', 3, false),
('Chemistry', 'CHEM', 3, false),
('Biology', 'BIO', 3, false),
('Elective Mathematics', 'MATH_E', 3, false),

-- Visual Art electives
('Picture Making', 'PIC_MAK', 4, false),
('Graphic Design', 'GRAPH_DES', 4, false),
('Sculpture', 'SCULP', 4, false),
('Textiles', 'TEXT', 4, false),

-- General Agricultural electives
('General Agriculture', 'GEN_AGRIC', 5, false),
('Animal Husbandry', 'ANIM_HUS', 5, false),
('Crop Husbandry', 'CROP_HUS', 5, false),

-- Home Economics electives
('Food and Nutrition', 'FOOD_NUT', 6, false),
('Clothing and Textiles', 'CLOTH_TEXT', 6, false),
('Management in Living', 'MGT_LIV', 6, false);

-- Insert sample classes
INSERT INTO classes (class_name, course_id, form, semester, stream, academic_year) VALUES 
('General Art 1A S1', 1, 1, 1, 'A', '2025/2026'),
('General Art 1B S1', 1, 1, 1, 'B', '2025/2026'),
('Business 1A S1', 2, 1, 1, 'A', '2025/2026'),
('Business 1B S1', 2, 1, 1, 'B', '2025/2026'),
('General Science 1A S1', 3, 1, 1, 'A', '2025/2026'),
('General Science 1B S1', 3, 1, 1, 'B', '2025/2026'),
('Visual Art 1A S1', 4, 1, 1, 'A', '2025/2026'),
('Agricultural 1A S1', 5, 1, 1, 'A', '2025/2026'),
('Home Economics 1A S1', 6, 1, 1, 'A', '2025/2026');

-- Create indexes for better performance
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_admission_number ON students(admission_number);
CREATE INDEX idx_students_current_class_id ON students(current_class_id);
CREATE INDEX idx_teachers_teacher_id ON teachers(teacher_id);
CREATE INDEX idx_teachers_staff_id ON teachers(staff_id);
CREATE INDEX idx_subjects_course_id ON subjects(course_id);
CREATE INDEX idx_classes_course_id ON classes(course_id);
CREATE INDEX idx_classes_form ON classes(form);
CREATE INDEX idx_classes_semester ON classes(semester);
CREATE INDEX idx_classes_course_form_semester ON classes(course_id, form, semester);
CREATE INDEX idx_class_subjects_class_id ON class_subjects(class_id);
CREATE INDEX idx_class_subjects_subject_id ON class_subjects(subject_id);

-- Indexes for timetable_entries
CREATE INDEX idx_timetable_entries_day ON timetable_entries(day);
CREATE INDEX idx_timetable_entries_class_id ON timetable_entries(class_id);
CREATE INDEX idx_timetable_entries_subject_id ON timetable_entries(subject_id);
CREATE INDEX idx_timetable_entries_teacher_id ON timetable_entries(teacher_id);
CREATE INDEX idx_timetable_entries_academic_year ON timetable_entries(academic_year);

-- Function to generate random password
CREATE OR REPLACE FUNCTION generate_random_password(length INTEGER DEFAULT 8)
RETURNS VARCHAR AS $$
DECLARE
    chars VARCHAR := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR := '';
    i INTEGER;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate next user ID
CREATE OR REPLACE FUNCTION generate_next_user_id(user_type_param VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    prefix VARCHAR(10);
    year VARCHAR(4);
    next_num INTEGER;
    result VARCHAR(20);
BEGIN
    year := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    CASE user_type_param
        WHEN 'student' THEN prefix := 'STU' || year;
        WHEN 'teacher' THEN prefix := 'TEA' || year;
        WHEN 'admin' THEN prefix := 'ADMIN';
        ELSE RAISE EXCEPTION 'Invalid user type';
    END CASE;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(user_id FROM LENGTH(prefix) + 1) AS INTEGER)), 0) + 1
    INTO next_num
    FROM users 
    WHERE user_id LIKE prefix || '%';
    
    result := prefix || LPAD(next_num::VARCHAR, 3, '0');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;