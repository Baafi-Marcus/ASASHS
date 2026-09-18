import dotenv from 'dotenv';
dotenv.config();
import { sql } from './lib/neon.ts';
import bcrypt from 'bcryptjs';

async function main() {
  const result = await sql`
    SELECT u.*, s.id as student_db_id, s.student_id, s.admission_number, s.surname as student_surname, s.other_names as student_other_names
    FROM users u
    LEFT JOIN students s ON u.id = s.user_id
    WHERE UPPER(u.user_id) IN ('STU2026001', 'STU2026002') OR UPPER(s.student_id) IN ('STU2026001', 'STU2026002')
  `;
  console.log('Result count:', result.length);
  for (const row of result) {
    console.log('User found:', row.user_id, 'is_active:', row.is_active, 'hash:', row.password_hash);
    const passwordsToTest = ['student123', 'Student123', 'password', 'password123', 'admin123', 'asashs123', row.user_id];
    for (const p of passwordsToTest) {
      const match = await bcrypt.compare(p, row.password_hash);
      if (match) {
        console.log(`  PASSWORD MATCHED for ${row.user_id}: "${p}"`);
      }
    }
  }
  process.exit(0);
}
main().catch(console.error);
