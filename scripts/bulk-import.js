import 'dotenv/config';
import { db } from '../lib/neon.ts'; // We can try to import the TS file directly if using ts-node or similar, but let's try a safe way
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importFromCsv(csvPath) {
  try {
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    // Skip header: Name, Class, Course
    const students = lines.slice(1).map(line => {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 3) return null;
      const [name, className, courseName] = parts;
      const nameParts = name.split(' ');
      const surname = nameParts[nameParts.length - 1];
      const otherNames = nameParts.slice(0, -1).join(' ');
      
      return { 
        surname, 
        other_names: otherNames,
        class_name: className,
        course_name: courseName
      };
    }).filter(Boolean);

    console.log(`Processing ${students.length} students...`);
    
    // Resolve Class and Course IDs
    console.log('Fetching courses and classes...');
    const courses = await db.getCourses();
    const classes = await db.getClasses();
    console.log(`Fetched ${courses.length} courses and ${classes.length} classes.`);

    const studentsWithIds = students.map(s => {
      const course = courses.find(c => c.name && c.name.toLowerCase() === s.course_name.toLowerCase());
      const cls = classes.find(c => c.class_name && c.class_name.toLowerCase() === s.class_name.toLowerCase());
      
      if (!course || !cls) {
        throw new Error(`Course or Class not found for student: ${s.surname}. Course: ${s.course_name}, Class: ${s.class_name}`);
      }

      return {
        surname: s.surname,
        other_names: s.other_names,
        course_id: course.id,
        class_id: cls.id
      };
    });

    console.log('Running bulk import...');
    const credentials = await db.bulkImportStudents(studentsWithIds);
    
    // Save credentials to a file
    const resultPath = path.join(__dirname, '..', 'student-credentials.csv');
    const header = 'Name,Student ID,Admission Number,Temporary Password\n';
    const rows = credentials.map(c => `${c.name},${c.studentId},${c.admissionNum},${c.tempPassword}`).join('\n');
    
    fs.writeFileSync(resultPath, header + rows);
    console.log('Import successful!');
    console.log(`Credentials saved to: ${resultPath}`);
    
  } catch (error) {
    console.error('Import failed:', error);
    if (error.stack) console.error(error.stack);
  }
}

// Example usage
const csvFile = process.argv[2];
if (!csvFile) {
  console.log('Usage: node scripts/bulk-import.js <path-to-csv>');
  process.exit(0);
}

importFromCsv(csvFile);
