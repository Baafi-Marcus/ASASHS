require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

function generateRandomPassword(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function run() {
  try {
    const csvPath = process.argv[2];
    if (!csvPath) {
      console.log('Usage: node scripts/standalone-import.cjs <path-to-csv>');
      process.exit(1);
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const students = lines.slice(1).map(line => {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 3) return null;
      return { name: parts[0], className: parts[1], courseName: parts[2] };
    }).filter(Boolean);

    console.log(`Processing ${students.length} students...`);

    const courses = await sql`SELECT * FROM courses WHERE is_active = true`;
    const classes = await sql`SELECT * FROM classes WHERE is_active = true`;

    const year = new Date().getFullYear();
    const results = [];

    // Get sequence starts
    const lastStu = await sql`SELECT user_id FROM users WHERE user_id LIKE ${`STU${year}%`} ORDER BY user_id DESC LIMIT 1`;
    let nextNum = 1;
    if (lastStu.length > 0) {
      const match = lastStu[0].user_id.match(/\d{3}$/);
      if (match) nextNum = parseInt(match[0]) + 1;
    }

    const lastAsa = await sql`SELECT admission_number FROM students WHERE admission_number LIKE ${`ASA${year}%`} ORDER BY admission_number DESC LIMIT 1`;
    let nextAsaNum = 1;
    if (lastAsa.length > 0) {
      const match = lastAsa[0].admission_number.match(/\d{3}$/);
      if (match) nextAsaNum = parseInt(match[0]) + 1;
    }

    for (const s of students) {
      const course = courses.find(c => c.name.toLowerCase() === s.courseName.toLowerCase());
      const cls = classes.find(c => c.class_name.toLowerCase() === s.className.toLowerCase());

      if (!course || !cls) {
        console.error(`Missing Course/Class for ${s.name}`);
        continue;
      }

      const studentId = `STU${year}${nextNum.toString().padStart(3, '0')}`;
      const admissionNum = `ASA${year}${nextAsaNum.toString().padStart(3, '0')}`;
      const tempPassword = generateRandomPassword(8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const nameParts = s.name.split(' ');
      const surname = nameParts[nameParts.length - 1];
      const otherNames = nameParts.slice(0, -1).join(' ');

      console.log(`- Importing ${s.name} (${studentId})`);

      const userRes = await sql`
        INSERT INTO users (user_id, user_type, password_hash, temp_password, must_change_password)
        VALUES (${studentId}, 'student', ${hashedPassword}, ${tempPassword}, true)
        RETURNING id
      `;
      
      const userId = userRes[0].id;

      await sql`
        INSERT INTO students (
          user_id, student_id, admission_number, surname, other_names, 
          current_class_id, course_id, registration_status, is_active
        ) VALUES (
          ${userId}, ${studentId}, ${admissionNum}, ${surname}, ${otherNames},
          ${cls.id}, ${course.id}, 'voter_only', true
        )
      `;

      results.push({ name: s.name, studentId, admissionNum, tempPassword });
      nextNum++;
      nextAsaNum++;
    }

    const resultPath = 'student-credentials-standalone.csv';
    const header = 'Name,Student ID,Admission Number,Temporary Password\n';
    const rows = results.map(r => `${r.name},${r.studentId},${r.admissionNum},${r.tempPassword}`).join('\n');
    fs.writeFileSync(resultPath, header + rows);

    console.log(`Successfully imported ${results.length} students.`);
    console.log(`Credentials saved to ${resultPath}`);

  } catch (error) {
    console.error('CRITICAL ERROR:', error);
  }
}

run();
