// test-teacher-search.js
import dotenv from 'dotenv';
dotenv.config();

// Import after dotenv config
const { sql, db } = await import('./lib/neon.ts');

async function testTeacherSearch() {
  try {
    console.log('🔍 Testing teacher search functionality...');
    
    // Check database connection
    const connectionTest = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected');
    
    // Test 1: Search for TCH001 using the getTeachers function
    console.log('\n🔍 Testing search for TCH001 (getTeachers function)...');
    const searchResult1 = await db.getTeachers({ search: 'TCH001', includeInactive: false });
    console.log(`   Found ${searchResult1.length} teacher(s) using getTeachers function`);
    
    if (searchResult1.length > 0) {
      console.log(`     Teacher ID: ${searchResult1[0].teacher_id}`);
      console.log(`     Surname: ${searchResult1[0].surname}`);
      console.log(`     Other Names: ${searchResult1[0].other_names}`);
    }
    
    // Test 2: Search for TEA2025002 using the getTeachers function
    console.log('\n🔍 Testing search for TEA2025002 (getTeachers function)...');
    const searchResult2 = await db.getTeachers({ search: 'TEA2025002', includeInactive: false });
    console.log(`   Found ${searchResult2.length} teacher(s) using getTeachers function`);
    
    if (searchResult2.length > 0) {
      console.log(`     Teacher ID: ${searchResult2[0].teacher_id}`);
      console.log(`     Surname: ${searchResult2[0].surname}`);
      console.log(`     Other Names: ${searchResult2[0].other_names}`);
    }
    
    // Test 3: Direct database query to find teachers by teacher_id
    console.log('\n🔍 Testing direct database query by teacher_id...');
    
    const directResult1 = await sql`
      SELECT t.*, u.user_id
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.teacher_id = 'TCH001' AND t.is_active = true
    `;
    
    console.log(`   TCH001 - Direct query found ${directResult1.length} teacher(s)`);
    if (directResult1.length > 0) {
      console.log(`     Teacher ID: ${directResult1[0].teacher_id}`);
      console.log(`     Surname: ${directResult1[0].surname}`);
      console.log(`     Other Names: ${directResult1[0].other_names}`);
    }
    
    const directResult2 = await sql`
      SELECT t.*, u.user_id
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.teacher_id = 'TEA2025002' AND t.is_active = true
    `;
    
    console.log(`   TEA2025002 - Direct query found ${directResult2.length} teacher(s)`);
    if (directResult2.length > 0) {
      console.log(`     Teacher ID: ${directResult2[0].teacher_id}`);
      console.log(`     Surname: ${directResult2[0].surname}`);
      console.log(`     Other Names: ${directResult2[0].other_names}`);
    }
    
    // Test 4: Check what the authenticateUser function would return
    console.log('\n🔍 Checking what authenticateUser would return...');
    
    // This would be the actual authentication query
    const authResult = await sql`
      SELECT u.*, t.teacher_id, t.staff_id, t.surname as teacher_surname, t.other_names as teacher_other_names
      FROM users u
      LEFT JOIN teachers t ON u.id = t.user_id
      WHERE u.user_id = 'TCH001' AND u.is_active = true
    `;
    
    if (authResult.length > 0) {
      console.log(`   Authenticated user: ${authResult[0].user_id}`);
      console.log(`   Teacher ID from auth: ${authResult[0].teacher_id}`);
      console.log(`   User type: ${authResult[0].user_type}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTeacherSearch();