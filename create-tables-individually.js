import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Handle environment variables
const getDatabaseUrl = () => {
  if (typeof process !== 'undefined') {
    return process.env.VITE_DATABASE_URL || process.env.DATABASE_URL || '';
  }
  return '';
};

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  throw new Error('DATABASE_URL or VITE_DATABASE_URL is not set in environment variables');
}

// Create the Neon SQL function
const sql = neon(databaseUrl);

async function createTables() {
  try {
    console.log('Creating tables individually...');
    
    // 1. Create assignment_types table
    console.log('\n1. Creating assignment_types table...');
    await sql`
      CREATE TABLE IF NOT EXISTS assignment_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ assignment_types table created');
    
    // 2. Insert default assignment types
    console.log('\n2. Inserting default assignment types...');
    await sql`
      INSERT INTO assignment_types (name, description) VALUES 
      ('Classwork', 'In-class assignments'),
      ('Homework', 'Take-home assignments'),
      ('Project', 'Student projects'),
      ('Class Test', 'Class tests'),
      ('Midsem Exam', 'Mid-semester examinations'),
      ('Exam', 'End-of-semester examinations')
      ON CONFLICT (name) DO NOTHING
    `;
    console.log('✅ Default assignment types inserted');
    
    // 3. Create assignments table
    console.log('\n3. Creating assignments table...');
    await sql`
      CREATE TABLE IF NOT EXISTS assignments (
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
      )
    `;
    console.log('✅ assignments table created');
    
    // 4. Create assignment_submissions table
    console.log('\n4. Creating assignment_submissions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        file_path VARCHAR(500),
        score DECIMAL(5,2),
        remarks TEXT,
        graded_by INTEGER REFERENCES teachers(id),
        graded_date TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ assignment_submissions table created');
    
    // 5. Create student_results table
    console.log('\n5. Creating student_results table...');
    await sql`
      CREATE TABLE IF NOT EXISTS student_results (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
        class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
        academic_year VARCHAR(9) NOT NULL,
        term INTEGER NOT NULL CHECK (term IN (1, 2, 3)),
        class_score DECIMAL(5,2),
        exam_score DECIMAL(5,2),
        total_score DECIMAL(5,2),
        grade VARCHAR(2),
        remarks TEXT,
        is_final BOOLEAN DEFAULT false,
        approved_by INTEGER REFERENCES teachers(id),
        approved_date TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, subject_id, academic_year, term)
      )
    `;
    console.log('✅ student_results table created');
    
    // 6. Create teacher_messages table
    console.log('\n6. Creating teacher_messages table...');
    await sql`
      CREATE TABLE IF NOT EXISTS teacher_messages (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
        class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
        subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_private BOOLEAN DEFAULT false,
        recipient_student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ teacher_messages table created');
    
    // 8. Create student_behavior_records table
    console.log('\n8. Creating student_behavior_records table...');
    await sql`
      CREATE TABLE IF NOT EXISTS student_behavior_records (
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
      )
    `;
    console.log('✅ student_behavior_records table created');
    
    // 7. Create indexes
    console.log('\n7. Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON assignments(class_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_assignments_subject_id ON assignments(subject_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_student_results_student_id ON student_results(student_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_student_results_subject_id ON student_results(subject_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_student_results_academic_year ON student_results(academic_year)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_student_results_term ON student_results(term)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_teacher_messages_teacher_id ON teacher_messages(teacher_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_teacher_messages_class_id ON teacher_messages(class_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_student_behavior_records_student_id ON student_behavior_records(student_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_student_behavior_records_date ON student_behavior_records(date)`;
    console.log('✅ Indexes created');
    
    console.log('\n🎉 All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createTables();