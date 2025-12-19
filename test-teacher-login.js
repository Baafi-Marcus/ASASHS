// test-teacher-login.js
import dotenv from 'dotenv';
dotenv.config();

// Import after dotenv config
const { sql } = await import('./lib/neon.ts');

async function testTeacherLogin() {
  try {
    console.log('🔍 Testing teacher login...');
    
    // Check database connection
    const connectionTest = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected');
    
    // Check if any teacher users exist
    const teachers = await sql`
      SELECT u.user_id, u.user_type, u.is_active, t.teacher_id, t.staff_id, t.surname, t.other_names
      FROM users u
      JOIN teachers t ON u.id = t.user_id
      ORDER BY u.created_at DESC
      LIMIT 10
    `;
    
    if (teachers.length === 0) {
      console.log('❌ No teacher users found in database');
      
      // Check if we can create a sample teacher
      console.log('🔧 Creating sample teacher...');
      
      // Generate a unique teacher ID
      const year = new Date().getFullYear();
      let teacherId = `TEA${year}001`;
      
      // Generate random password
      const tempPassword = 'teacher123';
      const bcrypt = (await import('bcryptjs')).default;
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      // Create user account
      const userResult = await sql`
        INSERT INTO users (user_id, user_type, password_hash, temp_password, must_change_password)
        VALUES (${teacherId}, 'teacher', ${hashedPassword}, ${tempPassword}, true)
        RETURNING id
      `;
      
      const userId = userResult[0].id;
      
      // Create teacher record
      await sql`
        INSERT INTO teachers (
          user_id, teacher_id, staff_id, title, surname, other_names, date_of_birth, gender, 
          nationality, employment_date, department, position_rank, 
          staff_type, personal_phone, personal_email, is_active
        ) VALUES (
          ${userId}, ${teacherId}, 'STAFF001', 'Mr', 'Sample', 'Teacher', '1980-01-01', 'Male', 
          'Ghanaian', '2020-09-01', 'Mathematics', 'Senior Teacher', 
          'Permanent', '+233123456789', 'teacher@asashs.edu.gh', true
        )
      `;
      
      console.log('✅ Sample teacher created');
      console.log('   Teacher ID:', teacherId);
      console.log('   Password:', tempPassword);
    } else {
      console.log('✅ Found', teachers.length, 'teacher(s):');
      teachers.forEach((teacher, index) => {
        console.log(`   ${index + 1}. ID: ${teacher.teacher_id}, Name: ${teacher.surname}, ${teacher.other_names}, Active: ${teacher.is_active ? 'Yes' : 'No'}`);
      });
    }
    
    console.log('\n📝 To test teacher login:');
    console.log('   1. Go to the Teacher Portal login page');
    console.log('   2. Use the Teacher ID and password shown above');
    console.log('   3. If you created a new teacher, use:');
    console.log('      Teacher ID: TEA2025001');
    console.log('      Password: teacher123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTeacherLogin();