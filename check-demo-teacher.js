// check-demo-teacher.js
import dotenv from 'dotenv';
dotenv.config();

// Import after dotenv config
const { sql } = await import('./lib/neon.ts');
import bcrypt from 'bcryptjs';

async function checkDemoTeacher() {
  try {
    console.log('🔍 Checking for demo teacher (TCH001)...');
    
    // Check if the demo teacher exists
    const demoTeacher = await sql`
      SELECT u.id, u.user_id, u.user_type, u.is_active, u.password_hash, u.temp_password,
             t.id as teacher_id, t.teacher_id, t.staff_id, t.surname, t.other_names
      FROM users u
      LEFT JOIN teachers t ON u.id = t.user_id
      WHERE u.user_id = 'TCH001'
    `;
    
    if (demoTeacher.length === 0) {
      console.log('❌ Demo teacher (TCH001) not found in database');
      
      // Let's create the demo teacher
      console.log('🔧 Creating demo teacher (TCH001)...');
      
      // Generate password hash for 'teacher123'
      const passwordHash = await bcrypt.hash('teacher123', 10);
      
      // Create user account
      const userResult = await sql`
        INSERT INTO users (user_id, user_type, password_hash, temp_password, must_change_password)
        VALUES ('TCH001', 'teacher', ${passwordHash}, 'teacher123', false)
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
          ${userId}, 'TCH001', 'STAFF001', 'Mr', 'Demo', 'Teacher', '1980-01-01', 'Male', 
          'Ghanaian', '2020-09-01', 'Mathematics', 'Senior Teacher', 
          'Permanent', '+233123456789', 'teacher@asashs.edu.gh', true
        )
      `;
      
      console.log('✅ Demo teacher (TCH001) created successfully');
      console.log('   Teacher ID: TCH001');
      console.log('   Password: teacher123');
    } else {
      console.log('✅ Demo teacher found:');
      console.log(`   Login ID: ${demoTeacher[0].user_id}`);
      console.log(`   Teacher ID: ${demoTeacher[0].teacher_id}`);
      console.log(`   Name: ${demoTeacher[0].surname}, ${demoTeacher[0].other_names}`);
      console.log(`   Active: ${demoTeacher[0].is_active ? 'Yes' : 'No'}`);
      console.log(`   Temp Password: ${demoTeacher[0].temp_password || 'None'}`);
      
      // Test the password
      if (demoTeacher[0].password_hash) {
        const isValidPassword = await bcrypt.compare('teacher123', demoTeacher[0].password_hash);
        console.log(`   Password 'teacher123' valid: ${isValidPassword ? '✅ Yes' : '❌ No'}`);
        
        if (!isValidPassword) {
          console.log('🔧 Updating password for demo teacher...');
          const newPasswordHash = await bcrypt.hash('teacher123', 10);
          await sql`
            UPDATE users 
            SET password_hash = ${newPasswordHash}
            WHERE user_id = 'TCH001'
          `;
          console.log('✅ Password updated successfully');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDemoTeacher();