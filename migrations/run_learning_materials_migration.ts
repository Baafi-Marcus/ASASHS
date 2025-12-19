import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use Vite's environment variable system
const databaseUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or VITE_DATABASE_URL is not set in environment variables');
}

// Create the Neon SQL function
const sql = neon(databaseUrl);

async function runMigration() {
  try {
    console.log('Running migration to add learning materials table...');
    
    // Create learning_materials table
    await sql`
      CREATE TABLE IF NOT EXISTS learning_materials (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
        class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
        subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        material_type VARCHAR(50) NOT NULL,
        academic_year VARCHAR(9) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Created learning_materials table');
    
    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_learning_materials_teacher_id ON learning_materials(teacher_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_learning_materials_class_id ON learning_materials(class_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_learning_materials_subject_id ON learning_materials(subject_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_learning_materials_material_type ON learning_materials(material_type)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_learning_materials_academic_year ON learning_materials(academic_year)
    `;
    
    console.log('Created indexes for learning_materials table');
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();