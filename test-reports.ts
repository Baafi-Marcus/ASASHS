import { db } from './lib/neon';

async function testReports() {
  try {
    console.log('Testing database functions...');
    
    // Test getStudents
    console.log('Fetching students...');
    const students = await db.getStudents({ limit: 10000, includeInactive: true });
    console.log('Students count:', students.length);
    if (students.length > 0) {
      console.log('First student:', students[0]);
    }
    
    // Test getTeachers
    console.log('Fetching teachers...');
    const teachers = await db.getTeachers({ limit: 10000 });
    console.log('Teachers count:', teachers.length);
    if (teachers.length > 0) {
      console.log('First teacher:', teachers[0]);
    }
    
    // Test getCourses
    console.log('Fetching courses...');
    const courses = await db.getCourses();
    console.log('Courses count:', courses.length);
    if (courses.length > 0) {
      console.log('First course:', courses[0]);
    }
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testReports();