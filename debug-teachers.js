// debug-teachers.js
import dotenv from 'dotenv';
dotenv.config();

// Import after dotenv config
const { sql } = await import('./lib/neon.ts');

async function debugTeachers() {
  try {
    console.log('🔍 Debugging teacher accounts...');
    
    // Check database connection
    const connectionTest = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected');
    
    // Check if any teacher users exist
    const teachers = await sql`
      SELECT u.id as user_id, u.user_id as teacher_login_id, u.user_type, u.is_active, u.password_hash, u.temp_password,
             t.id as teacher_id, t.teacher_id, t.staff_id, t.surname, t.other_names, t.department
      FROM users u
      JOIN teachers t ON u.id = t.user_id
      ORDER BY u.created_at DESC
    `;
    
    if (teachers.length === 0) {
      console.log('❌ No teacher users found in database');
    } else {
      console.log(`✅ Found ${teachers.length} teacher(s):`);
      teachers.forEach((teacher, index) => {
        console.log(`\n--- Teacher ${index + 1} ---`);
        console.log(`   Login ID: ${teacher.teacher_login_id}`);
        console.log(`   Teacher ID: ${teacher.teacher_id}`);
        console.log(`   Staff ID: ${teacher.staff_id}`);
        console.log(`   Name: ${teacher.surname}, ${teacher.other_names}`);
        console.log(`   Department: ${teacher.department}`);
        console.log(`   User Type: ${teacher.user_type}`);
        console.log(`   Active: ${teacher.is_active ? 'Yes' : 'No'}`);
        console.log(`   Temp Password: ${teacher.temp_password || 'None'}`);
        console.log(`   Has Password Hash: ${teacher.password_hash ? 'Yes' : 'No'}`);
      });
    }
    
    // Check if the demo teacher exists
    console.log('\n🔍 Checking for demo teacher (TCH001)...');
    const demoTeacher = await sql`
      SELECT u.id, u.user_id, u.user_type, u.is_active, u.password_hash, u.temp_password,
             t.id as teacher_id, t.teacher_id, t.staff_id, t.surname, t.other_names
      FROM users u
      LEFT JOIN teachers t ON u.id = t.user_id
      WHERE u.user_id = 'TCH001'
    `;
    
    if (demoTeacher.length === 0) {
      console.log('❌ Demo teacher (TCH001) not found');
    } else {
      console.log('✅ Demo teacher found:');
      console.log(`   Login ID: ${demoTeacher[0].user_id}`);
      console.log(`   Teacher ID: ${demoTeacher[0].teacher_id}`);
      console.log(`   Name: ${demoTeacher[0].surname}, ${demoTeacher[0].other_names}`);
      console.log(`   Active: ${demoTeacher[0].is_active ? 'Yes' : 'No'}`);
      console.log(`   Temp Password: ${demoTeacher[0].temp_password || 'None'}`);
    }
    
    // Check authentication function directly
    console.log('\n🔍 Testing authentication function...');
    const bcrypt = (await import('bcryptjs')).default;
    
    // Try to authenticate with demo credentials
    try {
      const authResult = await sql`
        SELECT u.*, t.teacher_id, t.staff_id, t.surname as teacher_surname, t.other_names as teacher_other_names
        FROM users u
        LEFT JOIN teachers t ON u.id = t.user_id
        WHERE u.user_id = 'TCH001' AND u.is_active = true
      `;
      
      if (authResult.length > 0) {
        const user = authResult[0];
        console.log(`   User found: ${user.user_id} (${user.user_type})`);
        console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
        
        // Test password 'teacher123' against the hash
        if (user.password_hash) {
          const isValidPassword = await bcrypt.compare('teacher123', user.password_hash);
          console.log(`   Password 'teacher123' valid: ${isValidPassword ? '✅ Yes' : '❌ No'}`);
        }
      } else {
        console.log('   No active user found with ID TCH001');
      }
    } catch (authError) {
      console.error('   Authentication test failed:', authError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugTeachers();