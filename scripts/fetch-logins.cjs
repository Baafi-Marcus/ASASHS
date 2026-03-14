const { Client } = require('pg');

const databaseUrl = 'postgresql://neondb_owner:npg_OPpsiSX0dEB5@ep-autumn-bush-adzmnun7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function getLogins() {
  try {
    await client.connect();
    console.log('--- Database Logins (Live) ---');
    
    // Get Admin
    const adminRes = await client.query("SELECT user_id, temp_password FROM users WHERE user_type = 'admin' AND is_active = true LIMIT 5");
    console.log('\nAdmins:');
    adminRes.rows.forEach(u => console.log(`ID: ${u.user_id}, Temp Pwd: ${u.temp_password || '[Hash Only]'}`));

    // Get Teachers
    const teacherRes = await client.query("SELECT user_id, temp_password FROM users WHERE user_type = 'teacher' AND is_active = true LIMIT 5");
    console.log('\nTeachers:');
    teacherRes.rows.forEach(u => console.log(`ID: ${u.user_id}, Temp Pwd: ${u.temp_password || '[Hash Only]'}`));

    // Get Students
    const studentRes = await client.query("SELECT user_id, temp_password FROM users WHERE user_type = 'student' AND is_active = true LIMIT 5");
    console.log('\nStudents:');
    studentRes.rows.forEach(u => console.log(`ID: ${u.user_id}, Temp Pwd: ${u.temp_password || '[Hash Only]'}`));

    await client.end();
  } catch (err) {
    console.error('Error fetching logins:', err);
    await client.end();
  }
}

getLogins();
