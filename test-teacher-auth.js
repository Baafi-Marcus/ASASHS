// test-teacher-auth.js
import dotenv from 'dotenv';
dotenv.config();

// Import after dotenv config
const { sql } = await import('./lib/neon.ts');
import bcrypt from 'bcryptjs';

async function testTeacherAuth() {
  try {
    console.log('🔍 Testing teacher authentication...');
    
    // Check database connection
    const connectionTest = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected');
    
    // Test authenticating the existing teacher
    console.log('\n🔍 Testing authentication for TEA2025002...');
    
    const authResult = await sql`
      SELECT u.*, t.teacher_id, t.staff_id, t.surname as teacher_surname, t.other_names as teacher_other_names
      FROM users u
      LEFT JOIN teachers t ON u.id = t.user_id
      WHERE u.user_id = 'TEA2025002' AND u.is_active = true
    `;
    
    if (authResult.length === 0) {
      console.log('❌ No active user found with ID TEA2025002');
      return;
    }
    
    const user = authResult[0];
    console.log(`✅ User found: ${user.user_id} (${user.user_type})`);
    console.log(`   Name: ${user.teacher_surname}, ${user.teacher_other_names}`);
    console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
    console.log(`   Must change password: ${user.must_change_password ? 'Yes' : 'No'}`);
    console.log(`   Temp Password: ${user.temp_password || 'None'}`);
    
    // Test the temp password
    if (user.temp_password) {
      console.log(`\n🔍 Testing temp password: ${user.temp_password}`);
      const isValidPassword = await bcrypt.compare(user.temp_password, user.password_hash);
      console.log(`   Temp password valid: ${isValidPassword ? '✅ Yes' : '❌ No'}`);
      
      // Also test the temp password directly
      const isValidDirect = await bcrypt.compare(user.temp_password, user.password_hash);
      console.log(`   Direct comparison: ${isValidDirect ? '✅ Yes' : '❌ No'}`);
    }
    
    // Try to authenticate with the temp password
    console.log(`\n🔍 Testing authentication with temp password...`);
    const authFunctionResult = await sql`
      SELECT u.*, t.teacher_id, t.staff_id, t.surname as teacher_surname, t.other_names as teacher_other_names
      FROM users u
      LEFT JOIN teachers t ON u.id = t.user_id
      WHERE u.user_id = 'TEA2025002' AND u.is_active = true
    `;
    
    if (authFunctionResult.length > 0) {
      const authUser = authFunctionResult[0];
      const isValidPassword = await bcrypt.compare(user.temp_password, authUser.password_hash);
      console.log(`   Authentication result: ${isValidPassword ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      if (isValidPassword) {
        console.log(`\n🎉 Teacher login should work with:`);
        console.log(`   Teacher ID: ${user.user_id}`);
        console.log(`   Password: ${user.temp_password}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTeacherAuth();