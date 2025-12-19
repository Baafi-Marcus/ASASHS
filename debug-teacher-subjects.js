// debug-teacher-subjects.js
import dotenv from 'dotenv';
dotenv.config();

// Import after dotenv config
const { sql } = await import('./lib/neon.ts');

async function debugTeacherSubjects() {
  try {
    console.log('🔍 Debugging teacher subject assignments...');
    
    // Check database connection
    const connectionTest = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected');
    
    // Check all teacher-subject assignments
    console.log('\n🔍 Checking all teacher-subject assignments...');
    const assignments = await sql`
      SELECT ts.*, t.teacher_id, t.surname as teacher_surname, t.other_names as teacher_other_names,
             s.name as subject_name, s.code as subject_code,
             c.class_name, c.form, c.stream
      FROM teacher_subjects ts
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
      JOIN classes c ON ts.class_id = c.id
      WHERE ts.is_active = true
      ORDER BY t.teacher_id, s.name
    `;
    
    if (assignments.length === 0) {
      console.log('❌ No teacher-subject assignments found');
    } else {
      console.log(`✅ Found ${assignments.length} teacher-subject assignments:`);
      assignments.forEach((assignment, index) => {
        console.log(`\n--- Assignment ${index + 1} ---`);
        console.log(`   Teacher ID: ${assignment.teacher_id}`);
        console.log(`   Teacher Name: ${assignment.teacher_surname}, ${assignment.teacher_other_names}`);
        console.log(`   Subject: ${assignment.subject_name} (${assignment.subject_code})`);
        console.log(`   Class: ${assignment.class_name} (Form ${assignment.form}${assignment.stream ? assignment.stream : ''})`);
        console.log(`   Academic Year: ${assignment.academic_year}`);
      });
    }
    
    // Check assignments for specific teachers
    console.log('\n🔍 Checking assignments for TCH001...');
    const tch001Assignments = await sql`
      SELECT ts.*, t.teacher_id, t.surname as teacher_surname, t.other_names as teacher_other_names,
             s.name as subject_name, s.code as subject_code,
             c.class_name, c.form, c.stream
      FROM teacher_subjects ts
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
      JOIN classes c ON ts.class_id = c.id
      WHERE t.teacher_id = 'TCH001' AND ts.is_active = true
      ORDER BY s.name
    `;
    
    if (tch001Assignments.length === 0) {
      console.log('   ❌ No assignments found for TCH001');
    } else {
      console.log(`   ✅ Found ${tch001Assignments.length} assignments for TCH001:`);
      tch001Assignments.forEach((assignment, index) => {
        console.log(`     ${index + 1}. ${assignment.subject_name} (${assignment.subject_code}) - ${assignment.class_name}`);
      });
    }
    
    console.log('\n🔍 Checking assignments for TEA2025002...');
    const tea2025002Assignments = await sql`
      SELECT ts.*, t.teacher_id, t.surname as teacher_surname, t.other_names as teacher_other_names,
             s.name as subject_name, s.code as subject_code,
             c.class_name, c.form, c.stream
      FROM teacher_subjects ts
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
      JOIN classes c ON ts.class_id = c.id
      WHERE t.teacher_id = 'TEA2025002' AND ts.is_active = true
      ORDER BY s.name
    `;
    
    if (tea2025002Assignments.length === 0) {
      console.log('   ❌ No assignments found for TEA2025002');
    } else {
      console.log(`   ✅ Found ${tea2025002Assignments.length} assignments for TEA2025002:`);
      tea2025002Assignments.forEach((assignment, index) => {
        console.log(`     ${index + 1}. ${assignment.subject_name} (${assignment.subject_code}) - ${assignment.class_name}`);
      });
    }
    
    // Check all subjects in the system
    console.log('\n🔍 Checking all subjects...');
    const subjects = await sql`
      SELECT * FROM subjects 
      WHERE is_active = true
      ORDER BY name
    `;
    
    if (subjects.length === 0) {
      console.log('   ❌ No subjects found');
    } else {
      console.log(`   ✅ Found ${subjects.length} subjects:`);
      subjects.forEach((subject, index) => {
        console.log(`     ${index + 1}. ${subject.name} (${subject.code})`);
      });
    }
    
    // Check all classes in the system
    console.log('\n🔍 Checking all classes...');
    const classes = await sql`
      SELECT * FROM classes 
      WHERE is_active = true
      ORDER BY form, stream
    `;
    
    if (classes.length === 0) {
      console.log('   ❌ No classes found');
    } else {
      console.log(`   ✅ Found ${classes.length} classes:`);
      classes.forEach((classItem, index) => {
        console.log(`     ${index + 1}. ${classItem.class_name} (Form ${classItem.form}${classItem.stream ? classItem.stream : ''})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugTeacherSubjects();