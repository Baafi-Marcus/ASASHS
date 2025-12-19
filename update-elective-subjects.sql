-- Update elective subjects for all courses according to Ghana curriculum
-- This script replaces the current elective subjects with the correct ones

-- First, remove all existing elective subjects (keep core subjects)
DELETE FROM subjects WHERE is_core = false;

-- Insert correct elective subjects for each course

-- 1. General Arts electives
INSERT INTO subjects (name, code, course_id, is_core) VALUES 
('Literature in English', 'LIT_ENG', 1, false),
('History', 'HIST', 1, false),
('Geography', 'GEOG', 1, false),
('Government', 'GOV', 1, false),
('Economics', 'ECON_GA', 1, false),
('Christian Religious Studies (CRS)', 'CRS', 1, false),
('Elective Mathematics', 'MATH_E_GA', 1, false),
('Ghanaian Language (Akwapim Twi)', 'TWI', 1, false),
('French', 'FRENCH', 1, false);

-- 2. General Science electives
INSERT INTO subjects (name, code, course_id, is_core) VALUES 
('Physics', 'PHYS', 3, false),
('Chemistry', 'CHEM', 3, false),
('Biology', 'BIO', 3, false),
('Elective Mathematics', 'MATH_E_GS', 3, false),
('Information and Communication Technology (ICT)', 'ICT_GS', 3, false);

-- 3. Business electives
INSERT INTO subjects (name, code, course_id, is_core) VALUES 
('Financial Accounting', 'FIN_ACC', 2, false),
('Costing', 'COST', 2, false),
('Business Management', 'BUS_MGT', 2, false),
('Economics', 'ECON_BUS', 2, false),
('Elective Mathematics', 'MATH_E_BUS', 2, false);

-- 4. Visual Arts electives
INSERT INTO subjects (name, code, course_id, is_core) VALUES 
('General Knowledge in Art', 'GEN_ART', 4, false),
('Information and Communication Technology (ICT)', 'ICT_VA', 4, false),
('Graphic Design', 'GRAPH_DES', 4, false),
('Picture Making', 'PIC_MAK', 4, false),
('Sculpture', 'SCULP', 4, false);

-- 5. Home Economics electives
INSERT INTO subjects (name, code, course_id, is_core) VALUES 
('Management in Living', 'MGT_LIV', 6, false),
('Food and Nutrition', 'FOOD_NUT', 6, false),
('Clothing and Textiles', 'CLOTH_TEXT', 6, false),
('Biology', 'BIO_HE', 6, false),
('General Knowledge in Art', 'GEN_ART_HE', 6, false);

-- 6. Agricultural Science electives
INSERT INTO subjects (name, code, course_id, is_core) VALUES 
('General Agriculture', 'GEN_AGRIC', 5, false),
('Chemistry', 'CHEM_AG', 5, false),
('Animal Husbandry', 'ANIM_HUS', 5, false),
('Elective Mathematics', 'MATH_E_AG', 5, false);

-- Update course names to match the curriculum
UPDATE courses SET name = 'General Art' WHERE id = 1;
UPDATE courses SET name = 'Business' WHERE id = 2;
UPDATE courses SET name = 'General Science' WHERE id = 3;
UPDATE courses SET name = 'Visual Art' WHERE id = 4;
UPDATE courses SET name = 'Agricultural Science' WHERE id = 5;
UPDATE courses SET name = 'Home Economics' WHERE id = 6;

-- Verify the results
SELECT 
    c.name as course_name,
    s.name as subject_name,
    s.code as subject_code,
    s.is_core
FROM courses c
LEFT JOIN subjects s ON c.id = s.course_id
ORDER BY c.id, s.is_core DESC, s.name;

COMMIT;