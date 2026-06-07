import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon('postgresql://neondb_owner:npg_OPpsiSX0dEB5@ep-autumn-bush-adzmnun7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function safeDelete(query) {
  try {
    await query;
  } catch (err) {
    if (err.code === '42P01') {
      // relation does not exist, safe to ignore
    } else {
      console.error('Error executing query:', err.message);
    }
  }
}

async function wipe() {
  try {
    console.log('Starting database wipe...');
    
    // 1. Delete all classes and dependent records
    console.log('Deleting dependent records of classes...');
    await safeDelete(sql`DELETE FROM student_votes`);
    await safeDelete(sql`DELETE FROM election_candidates`);
    await safeDelete(sql`DELETE FROM elections`);
    await safeDelete(sql`DELETE FROM attendance`);
    await safeDelete(sql`DELETE FROM messages`);
    
    await safeDelete(sql`DELETE FROM submission_grades`);
    await safeDelete(sql`DELETE FROM assignment_submissions`);
    await safeDelete(sql`DELETE FROM assignments`);
    
    await safeDelete(sql`DELETE FROM exam_results`);
    await safeDelete(sql`DELETE FROM class_subjects`);
    await safeDelete(sql`DELETE FROM teacher_subjects`);
    await safeDelete(sql`DELETE FROM subjects`);
    
    console.log('Deleting classes...');
    await safeDelete(sql`UPDATE students SET current_class_id = NULL`);
    await safeDelete(sql`DELETE FROM classes`);
    
    // 2. Delete all users except ADMIN001
    console.log('Deleting users (students and teachers)...');
    await safeDelete(sql`DELETE FROM students`);
    await safeDelete(sql`DELETE FROM teachers`);
    await safeDelete(sql`DELETE FROM admins`);
    
    // Check if ADMIN001 exists
    const adminExists = await sql`SELECT * FROM users WHERE user_id = 'ADMIN001'`;
    
    if (adminExists.length === 0) {
      console.log('ADMIN001 not found, will create after wiping...');
    }
    
    console.log('Deleting from users table...');
    await safeDelete(sql`DELETE FROM users WHERE user_id != 'ADMIN001'`);
    
    if (adminExists.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await sql`
        INSERT INTO users (user_id, password_hash, user_type, full_name, role)
        VALUES ('ADMIN001', ${hash}, 'admin', 'Administrator', 'admin')
      `;
      console.log('Recreated ADMIN001');
    } else {
      // Ensure password is admin123
      const hash = await bcrypt.hash('admin123', 10);
      await sql`
        UPDATE users SET password_hash = ${hash} WHERE user_id = 'ADMIN001'
      `;
      console.log('Updated ADMIN001 password to admin123');
    }

    console.log('Wipe complete!');
  } catch (err) {
    console.error('Fatal error during wipe:', err);
  }
}

wipe();
