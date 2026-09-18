import dotenv from 'dotenv';
dotenv.config();
import { sql, db } from './lib/neon.ts';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Generating new hash for "student123"...');
  const newHash = await bcrypt.hash('student123', 10);
  console.log('Updating password for STU2026001 and STU2026002...');
  
  await sql`
    UPDATE users 
    SET password_hash = ${newHash} 
    WHERE UPPER(user_id) IN ('STU2026001', 'STU2026002') OR id IN (
      SELECT user_id FROM students WHERE UPPER(student_id) IN ('STU2026001', 'STU2026002') OR UPPER(admission_number) IN ('ASA2026001', 'ASA2026002')
    )
  `;

  // Ensure STU2026001 also has student_id and admission_number set
  await sql`
    UPDATE students
    SET student_id = 'STU2026001', admission_number = 'ASA2026001'
    WHERE user_id = (SELECT id FROM users WHERE user_id = 'STU2026001')
  `;

  console.log('Testing authentication for STU2026001 with "student123"...');
  const r1 = await db.authenticateUser('STU2026001', 'student123');
  console.log('r1 success:', r1 !== null, r1?.user_id, r1?.full_name);

  console.log('Testing authentication for ASA2026001 with "student123"...');
  const r2 = await db.authenticateUser('ASA2026001', 'student123');
  console.log('r2 success:', r2 !== null, r2?.user_id, r2?.full_name);

  process.exit(0);
}
main().catch(console.error);
