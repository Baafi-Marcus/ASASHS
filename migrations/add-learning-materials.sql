-- Add table for learning materials (lesson notes, resources, etc.)

CREATE TABLE learning_materials (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- pdf, doc, docx, ppt, etc.
    material_type VARCHAR(50) NOT NULL, -- lesson_notes, assignment, assessment, resource
    academic_year VARCHAR(9) NOT NULL, -- 2025/2026
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_learning_materials_teacher_id ON learning_materials(teacher_id);
CREATE INDEX idx_learning_materials_class_id ON learning_materials(class_id);
CREATE INDEX idx_learning_materials_subject_id ON learning_materials(subject_id);
CREATE INDEX idx_learning_materials_material_type ON learning_materials(material_type);
CREATE INDEX idx_learning_materials_academic_year ON learning_materials(academic_year);