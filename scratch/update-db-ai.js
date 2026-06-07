import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_OPpsiSX0dEB5@ep-autumn-bush-adzmnun7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function updateDb() {
  try {
    console.log('Creating elearning_quizzes table if not exists...');
    await sql`
      CREATE TABLE IF NOT EXISTS elearning_quizzes (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER,
        class_id INTEGER,
        subject_id INTEGER,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructions TEXT,
        time_limit INTEGER,
        passing_score INTEGER,
        total_points INTEGER,
        shuffle_questions BOOLEAN DEFAULT false,
        shuffle_options BOOLEAN DEFAULT false,
        show_results_immediately BOOLEAN DEFAULT true,
        allow_late_grading BOOLEAN DEFAULT false,
        display_mode VARCHAR(20) DEFAULT 'all_at_once',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Creating quiz_questions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES elearning_quizzes(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) NOT NULL,
        points INTEGER DEFAULT 1,
        order_index INTEGER DEFAULT 0
      )
    `;

    console.log('Creating quiz_options table...');
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_options (
        id SERIAL PRIMARY KEY,
        question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
        option_text TEXT NOT NULL,
        is_correct BOOLEAN DEFAULT false
      )
    `;

    console.log('Creating quiz_correct_answers table...');
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_correct_answers (
        id SERIAL PRIMARY KEY,
        question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
        answer_text TEXT NOT NULL
      )
    `;

    console.log('Creating quiz_attempts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id SERIAL PRIMARY KEY,
        student_id INTEGER,
        quiz_id INTEGER REFERENCES elearning_quizzes(id) ON DELETE CASCADE,
        score INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'in-progress',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Creating quiz_responses table...');
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_responses (
        id SERIAL PRIMARY KEY,
        attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
        response_text TEXT,
        is_correct BOOLEAN,
        points_earned INTEGER DEFAULT 0
      )
    `;

    console.log('Creating ai_api_keys table...');
    await sql`
      CREATE TABLE IF NOT EXISTS ai_api_keys (
        id SERIAL PRIMARY KEY,
        provider VARCHAR(50) NOT NULL,
        key_value VARCHAR(255) NOT NULL,
        priority INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        last_failed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Updating assignments...');
    await sql`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS shuffle_options BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS show_results_immediately BOOLEAN DEFAULT true`;
    await sql`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS allow_late_grading BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS display_mode VARCHAR(20) DEFAULT 'all_at_once'`;

    console.log('Database updated successfully!');
  } catch (err) {
    console.error('Error updating database:', err);
  }
}

updateDb();
