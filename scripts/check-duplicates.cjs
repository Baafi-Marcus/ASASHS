
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
const sql = neon(databaseUrl);

async function checkDuplicates() {
  try {
    console.log('--- Checking for Duplicate Students (Same Surname & Other Names) ---');
    const duplicateStudents = await sql`
      SELECT surname, other_names, COUNT(*) 
      FROM students 
      GROUP BY surname, other_names 
      HAVING COUNT(*) > 1
    `;
    console.log(duplicateStudents);

    console.log('\n--- Checking for Duplicate Teachers (Same Surname & Other Names) ---');
    const duplicateTeachers = await sql`
      SELECT surname, other_names, COUNT(*) 
      FROM teachers 
      GROUP BY surname, other_names 
      HAVING COUNT(*) > 1
    `;
    console.log(duplicateTeachers);

    console.log('\n--- All Students ---');
    const allStudents = await sql`SELECT student_id, surname, other_names, created_at FROM students ORDER BY surname, other_names`;
    console.log(allStudents);

    console.log('\n--- All Teachers ---');
    const allTeachers = await sql`SELECT teacher_id, surname, other_names, created_at FROM teachers ORDER BY surname, other_names`;
    console.log(allTeachers);

  } catch (error) {
    console.error('Error checking duplicates:', error);
  }
}

checkDuplicates();
