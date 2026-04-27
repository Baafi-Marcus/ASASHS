const { neon } = require('@neondatabase/serverless');

const dbUrl = 'postgresql://neondb_owner:npg_OPpsiSX0dEB5@ep-autumn-bush-adzmnun7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(dbUrl);

async function main() {
  const users = await sql`
    SELECT 
      u.user_type, 
      u.user_id, 
      u.is_active as user_active,
      s.is_active as student_active,
      t.is_active as teacher_active,
      COALESCE(s.surname || ' ' || s.other_names, t.surname || ' ' || t.other_names, 'Admin') as full_name
    FROM users u
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN teachers t ON u.id = t.user_id
    WHERE u.temp_password IS NOT NULL
  `;
  
  console.log("=== USER STATUS ===");
  users.forEach(u => {
    const isActive = u.user_type === 'student' ? u.student_active : u.user_type === 'teacher' ? u.teacher_active : u.user_active;
    console.log(`${u.user_type} | ${u.user_id} | ${u.full_name} | Active: ${isActive}`);
  });
}

main().catch(console.error);
