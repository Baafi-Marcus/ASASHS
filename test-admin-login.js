// test-admin-login.js
import dotenv from 'dotenv';
dotenv.config();

// Import after dotenv config
const { sql } = await import('./lib/neon.ts');

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login...');
    
    // Check database connection
    const connectionTest = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected');
    
    // Check if admin user exists
    const adminUser = await sql`
      SELECT user_id, user_type, password_hash, must_change_password 
      FROM users WHERE user_id = 'ADMIN001'
    `;
    
    if (adminUser.length === 0) {
      console.log('❌ Admin user not found. Creating...');
      
      // Create admin user
      await sql`
        INSERT INTO users (user_id, user_type, password_hash, must_change_password, temp_password) 
        VALUES ('ADMIN001', 'admin', '$2b$10$eXqfszx/nIZ.a3QUesk31e1ZMJLxNparJazxP2EVQz/LgJTGURYlO', false, 'admin123')
        ON CONFLICT (user_id) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        must_change_password = EXCLUDED.must_change_password,
        temp_password = EXCLUDED.temp_password
      `;
      
      console.log('✅ Admin user created/updated');
    } else {
      console.log('✅ Admin user found:', adminUser[0]);
    }
    
    // Test password authentication
    const bcrypt = (await import('bcryptjs')).default;
    const user = await sql`SELECT password_hash FROM users WHERE user_id = 'ADMIN001'`;
    
    if (user.length > 0) {
      const isValidPassword = await bcrypt.compare('admin123', user[0].password_hash);
      console.log('🔐 Password test result:', isValidPassword ? '✅ VALID' : '❌ INVALID');
      
      if (!isValidPassword) {
        console.log('🔧 Updating password hash...');
        const newHash = await bcrypt.hash('admin123', 10);
        await sql`
          UPDATE users 
          SET password_hash = ${newHash}
          WHERE user_id = 'ADMIN001'
        `;
        console.log('✅ Password hash updated');
      }
    }
    
    console.log('\\n🎉 Admin login should now work with:');
    console.log('   User ID: ADMIN001');
    console.log('   Password: admin123');
    console.log('   OR');
    console.log('   Email: admin@asashs.edu.gh');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAdminLogin();