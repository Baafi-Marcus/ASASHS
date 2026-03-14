require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const databaseUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL or VITE_DATABASE_URL is not set in environment variables');
}

const sql = databaseUrl ? neon(databaseUrl) : null;

const db = {
  // Utility within the object
  generateRandomPassword(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  async getCourses() {
    return await sql`SELECT * FROM courses WHERE is_active = true ORDER BY name`;
  },
  
  async getClasses() {
    return await sql`SELECT * FROM classes WHERE is_active = true ORDER BY form, stream`;
  },

  async bulkImportStudents(studentsList) {
    const year = new Date().getFullYear();
    const results = [];
    
    console.log(`Starting bulk import for ${studentsList.length} students...`);
    
    // 1. Get sequences ...
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

    for (const student of studentsList) {
      const studentId = `STU${year}${nextNum.toString().padStart(3, '0')}`;
      const admissionNum = `ASA${year}${nextAsaNum.toString().padStart(3, '0')}`;
      const tempPassword = this.generateRandomPassword(8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      console.log(`- Importing ${student.surname} as ${studentId}`);
      
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
          ${userId}, ${studentId}, ${admissionNum}, ${student.surname}, ${student.other_names},
          ${student.class_id}, ${student.course_id}, 'voter_only', true
        )
      `;

      results.push({
        name: `${student.surname} ${student.other_names}`,
        studentId,
        admissionNum,
        tempPassword
      });

      nextNum++;
      nextAsaNum++;
    }

    return results;
  }
};

module.exports = { db };
