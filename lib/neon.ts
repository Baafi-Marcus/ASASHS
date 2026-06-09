// lib/neon.ts
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';



// Handle environment variables for both Node.js and browser environments
const getDatabaseUrl = () => {
  // In browser environment
  if (typeof window !== 'undefined') {
    // Try to get from import.meta.env (Vite)
    // @ts-ignore
    if (import.meta.env && import.meta.env.VITE_DATABASE_URL) {
      // @ts-ignore
      return import.meta.env.VITE_DATABASE_URL;
    }
    
    // Try to get DATABASE_URL as fallback
    // @ts-ignore
    if (import.meta.env && import.meta.env.DATABASE_URL) {
      // @ts-ignore
      return import.meta.env.DATABASE_URL;
    }
    
    return '';
  }
  
  // In Node.js environment
  try {
    // @ts-ignore
    return process.env.VITE_DATABASE_URL || process.env.DATABASE_URL || '';
  } catch (e) {
    // If process is not defined, return empty string
    return '';
  }
};

const databaseUrl = getDatabaseUrl();

// Create the Neon SQL function only if we have a database URL
let sql: any;
if (databaseUrl) {
  try {
    sql = neon(databaseUrl, { disableWarningInBrowsers: true } as any);
  } catch (error) {
    console.error('Failed to initialize Neon SQL function:', error);
    sql = null;
  }
} else {
  console.warn('DATABASE_URL or VITE_DATABASE_URL is not set in environment variables');
  // Create a mock sql function for development
  sql = async () => {
    console.warn('Database not configured - returning empty result');
    return [];
  };
  // Add the unsafe method to the mock sql function for string interpolation
  sql.unsafe = (str: string) => str;
}

// Utility function to check if database is configured
const checkDatabaseConfig = () => {
  if (!databaseUrl || !sql) {
    throw new Error('Database not configured. Please set DATABASE_URL or VITE_DATABASE_URL in your environment variables.');
  }
};

// Utility function to generate random password
function generateRandomPassword(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Read-only mode flag for test accounts
let readOnlyMode = false;

export function setReadOnlyMode(enabled: boolean) {
  readOnlyMode = enabled;
}

// Tables that test accounts can write to (quiz/exam/messaging)
const allowedWriteTables = [
  'elearning_quizzes', 'elearning_quiz_questions', 'quiz_attempts',
  'general_exams', 'exam_class_assignments', 'exam_questions',
  'student_results', 'assignment_submissions', 'learning_materials',
  'messages', 'behavior_records', 'audit_log',
  'elections', 'votes', 'candidates', 'ict_registrations',
  'announcements', 'timetable_entries'
];

// Wrap sql to block writes when in read-only mode
const _sql = sql;
if (_sql) {
  sql = new Proxy(_sql, {
    apply(target, thisArg, args) {
      if (readOnlyMode) {
        const queryStr = args[0]?.__rawQueries?.[0] || String(args[0] || '');
        const match = queryStr.match(/^\s*(INSERT\s+(?:INTO\s+)?|UPDATE\s+|DELETE\s+FROM\s+|ALTER\s+TABLE\s+)(?:"?\w+"?\.)?("?\w+"?)\b/i);
        if (match) {
          const tableName = match[2].replace(/"/g, '').toLowerCase();
          const isAllowed = allowedWriteTables.includes(tableName);
          const isMigration = /CREATE TABLE IF NOT EXISTS/i.test(queryStr) || /ADD COLUMN IF NOT EXISTS/i.test(queryStr);
          if (!isAllowed && !isMigration) {
            throw new Error(`Test accounts cannot modify "${tableName}" table.`);
          }
        }
      }
      return Reflect.apply(target, thisArg, args);
    }
  });
}

// Database helper functions
export const db = {
  // Authentication
  async authenticateUser(userId: string, password: string) {
    if (!databaseUrl || !sql) {
      console.warn('Database not configured - authentication will fail');
      return null;
    }
    
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_test_account BOOLEAN DEFAULT false`;
    } catch {}
    const result = await sql`
      SELECT u.*, s.id as student_db_id, s.student_id, s.admission_number, s.surname as student_surname, s.other_names as student_other_names,
             s.current_class_id,
             c.class_name as student_class_name,
             t.teacher_id, t.staff_id, t.surname as teacher_surname, t.other_names as teacher_other_names,
             t.id as teacher_db_id
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN classes c ON s.current_class_id = c.id
      LEFT JOIN teachers t ON u.id = t.user_id
      WHERE u.user_id = ${userId} AND u.is_active = true
    `;
    
    if (result.length === 0) {
      return null;
    }
    
    const user = result[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return null;
    }
    
    // Update last login
    await sql`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ${user.id}`;
    
      return {
      id: user.id,
      user_id: user.user_id,
      user_type: user.user_type,
      must_change_password: user.must_change_password,
      full_name: user.user_type === 'student' 
        ? `${user.student_surname}, ${user.student_other_names}`
        : user.user_type === 'teacher'
        ? `${user.teacher_surname}, ${user.teacher_other_names}`
        : (user.full_name || 'Administrator'),
      role: user.user_type,
      student_id: user.student_id,
      student_db_id: user.student_db_id,
      teacher_id: user.teacher_id,
      teacher_db_id: user.teacher_db_id,
      admission_number: user.admission_number,
      staff_id: user.staff_id,
      current_class_id: user.current_class_id,
      class_name: user.student_class_name,
      is_test_account: user.is_test_account === true
    };
  },

  async changePassword(userId: string, newPassword: string) {
    if (!databaseUrl || !sql) {
      throw new Error('Database not configured. Please set DATABASE_URL or VITE_DATABASE_URL in your environment variables.');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}, 
          must_change_password = false,
          temp_password = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `;
  },

  // Students
  async getStudents(filters?: {
    search?: string;
    course_id?: number;
    gender?: string;
    unassignedHouse?: boolean; // New parameter for filtering students with unassigned houses
    house5?: boolean; // New parameter for filtering students in House 5
    page?: number;
    limit?: number;
    includeInactive?: boolean; // New parameter
  }) {
    const { search, course_id, gender, unassignedHouse, house5, page = 1, limit = 10, includeInactive = false } = filters || {};
    
    // Base query condition
    const isActiveCondition = includeInactive ? '' : 'AND s.is_active = true';
    
    // Use template literals for complex filtering
    if (search) {
      return await sql`
        SELECT s.*, c.name as course_name, cl.class_name, u.user_id
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN classes cl ON s.current_class_id = cl.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1 ${sql.unsafe(isActiveCondition)}
        AND (s.surname ILIKE ${`%${search}%`} OR s.other_names ILIKE ${`%${search}%`} OR s.student_id ILIKE ${`%${search}%`})
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
    }
    
    if (course_id) {
      return await sql`
        SELECT s.*, c.name as course_name, cl.class_name, u.user_id
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN classes cl ON s.current_class_id = cl.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1 ${sql.unsafe(isActiveCondition)} AND s.course_id = ${course_id}
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
    }
    
    if (gender) {
      return await sql`
        SELECT s.*, c.name as course_name, cl.class_name, u.user_id
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN classes cl ON s.current_class_id = cl.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1 ${sql.unsafe(isActiveCondition)} AND s.gender = ${gender}
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
    }
    
    // New filter for students with unassigned houses
    if (unassignedHouse) {
      return await sql`
        SELECT s.*, c.name as course_name, cl.class_name, u.user_id
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN classes cl ON s.current_class_id = cl.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1 ${sql.unsafe(isActiveCondition)} AND (s.house_preference IS NULL OR s.house_preference = '' OR s.house_preference = 'Not Assigned')
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
    }
    
    // New filter for students in House 5
    if (house5) {
      return await sql`
        SELECT s.*, c.name as course_name, cl.class_name, u.user_id
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN classes cl ON s.current_class_id = cl.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1 ${sql.unsafe(isActiveCondition)} AND s.house_preference = 'House 5'
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
    }
    
    return await sql`
      SELECT s.*, c.name as course_name, cl.class_name, u.user_id
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN classes cl ON s.current_class_id = cl.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1 ${sql.unsafe(isActiveCondition)}
      ORDER BY s.created_at DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;
  },

  // New function to assign unassigned students to House 5
  async assignUnassignedToHouse5() {
    try {
      const result = await sql`
        UPDATE students 
        SET house_preference = 'House 5'
        WHERE house_preference IS NULL OR house_preference = '' OR house_preference = 'Not Assigned'
        RETURNING *
      `;
      
      return {
        success: true,
        updatedCount: result.length,
        message: `Successfully updated ${result.length} students to House 5`
      };
    } catch (error) {
      console.error('Error assigning students to House 5:', error);
      throw new Error('Failed to assign students to House 5');
    }
  },

  async createStudent(studentData: any) {
    // Generate student ID and admission number
    const year = new Date().getFullYear();
    
    // Generate a unique student ID by checking for existing IDs
    let studentId;
    let nextStudentNum = 1;
    let isUnique = false;
    
    while (!isUnique) {
      studentId = `STU${year}${nextStudentNum.toString().padStart(3, '0')}`;
      
      // Check if this ID already exists
      const existingUser = await sql`
        SELECT 1 FROM users WHERE user_id = ${studentId}
      `;
      
      if (existingUser.length === 0) {
        isUnique = true;
      } else {
        nextStudentNum++;
      }
    }
    
    // Generate a unique admission number
    let admissionNumber = studentData.admission_number;
    if (!admissionNumber) {
      let nextAdmissionNum = 1;
      let isAdmissionUnique = false;
      
      while (!isAdmissionUnique) {
        admissionNumber = `ASA${year}${nextAdmissionNum.toString().padStart(3, '0')}`;
        
        // Check if this admission number already exists
        const existingStudent = await sql`
          SELECT 1 FROM students WHERE admission_number = ${admissionNumber}
        `;
        
        if (existingStudent.length === 0) {
          isAdmissionUnique = true;
        } else {
          nextAdmissionNum++;
        }
      }
    }
    
    // Generate random password
    const tempPassword = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Create user account
    const userResult = await sql`
      INSERT INTO users (user_id, user_type, password_hash, temp_password, must_change_password)
      VALUES (${studentId}, 'student', ${hashedPassword}, ${tempPassword}, true)
      RETURNING id
    `;
    
    const userId = userResult[0].id;
    
    // Create student record
    const result = await sql`
      INSERT INTO students (
        user_id, student_id, admission_number, course_id, current_class_id, surname, other_names,
        date_of_birth, gender, nationality, hometown, district_of_origin,
        region_of_origin, guardian_name, guardian_relationship, guardian_phone,
        guardian_phone_alt, guardian_email, guardian_address, previous_school,
        graduation_year, known_allergies, chronic_conditions, blood_group,
        enrollment_date, residential_status, house_preference, is_active
      ) VALUES (
        ${userId}, ${studentId}, ${admissionNumber}, ${studentData.programme_id || studentData.course_id}, ${studentData.current_class_id}, 
        ${studentData.surname}, ${studentData.other_names}, ${studentData.date_of_birth}, 
        ${studentData.gender}, ${studentData.nationality}, ${studentData.hometown}, 
        ${studentData.district_of_origin}, ${studentData.region_of_origin}, ${studentData.guardian_name}, 
        ${studentData.guardian_relationship}, ${studentData.guardian_phone}, ${studentData.guardian_phone_alt}, 
        ${studentData.guardian_email}, ${studentData.guardian_address}, ${studentData.previous_school}, 
        ${studentData.graduation_year}, ${studentData.known_allergies}, ${studentData.chronic_conditions}, 
        ${studentData.blood_group}, ${studentData.enrollment_date}, 
        ${studentData.residential_status || 'Day Student'}, ${studentData.house_preference || null}, true
      ) RETURNING *
    `;
    
    const studentRecord = result[0];
    
    // Save student subjects if provided
    const academicYear = new Date().getFullYear() + '/' + (new Date().getFullYear() + 1);
    
    // Get core subjects for the course
    const coreSubjects = await sql`
      SELECT id FROM subjects WHERE (course_id = ${studentData.programme_id || studentData.course_id} OR course_id IS NULL) AND is_core = true
    `;
    
    // Insert core subjects
    for (const subject of coreSubjects) {
      await sql`
        INSERT INTO student_subjects (student_id, subject_id, academic_year, is_active)
        VALUES (${studentRecord.id}, ${subject.id}, ${academicYear}, true)
        ON CONFLICT (student_id, subject_id, academic_year) DO UPDATE SET is_active = true
      `;
    }
    
    // Insert elective subjects if provided
    const electiveSubjectIds = [
      studentData.elective_subject_1,
      studentData.elective_subject_2,
      studentData.elective_subject_3,
      studentData.elective_subject_4
    ].filter(id => id && id !== '');
    
    for (const subjectId of electiveSubjectIds) {
      const subjectIdNum = parseInt(subjectId);
      if (!isNaN(subjectIdNum)) {
        await sql`
          INSERT INTO student_subjects (student_id, subject_id, academic_year, is_active)
          VALUES (${studentRecord.id}, ${subjectIdNum}, ${academicYear}, true)
          ON CONFLICT (student_id, subject_id, academic_year) DO UPDATE SET is_active = true
        `;
      }
    }
    
    return {
      ...studentRecord,
      student_id: studentId,
      password: tempPassword
    };
  },

  async resetStudentPassword(studentDbId: number) {
    try {
      const tempPassword = generateRandomPassword(8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const result = await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}, 
            temp_password = ${tempPassword},
            must_change_password = true,
            updated_at = CURRENT_TIMESTAMP
        FROM students
        WHERE students.id = ${studentDbId} AND users.id = students.user_id
        RETURNING users.user_id, users.temp_password
      `;

      if (result.length === 0) {
        const studentResult = await sql`SELECT student_id FROM students WHERE id = ${studentDbId}`;
        if (studentResult.length === 0) throw new Error('Student not found');
        const studentId = studentResult[0].student_id;
        await sql`
          UPDATE users 
          SET password_hash = ${hashedPassword}, 
              temp_password = ${tempPassword},
              must_change_password = true,
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${studentId}
        `;
      }

      return { student_id: '', password: tempPassword };
    } catch (error) {
      console.error('Error resetting student password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to reset password: ${errorMessage}`);
    }
  },

  async getStudentById(studentId: number) {
    try {
      const result = await sql`
        SELECT s.*, c.name as course_name, cl.class_name, u.user_id
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN classes cl ON s.current_class_id = cl.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.id = ${studentId}
      `;
      
      if (result.length === 0) {
        throw new Error('Student not found');
      }
      
      // Convert date objects to strings to prevent React rendering issues
      const student = result[0];
      return {
        ...student,
        date_of_birth: student.date_of_birth ? student.date_of_birth.toString() : '',
        enrollment_date: student.enrollment_date ? student.enrollment_date.toString() : '',
        created_at: student.created_at ? student.created_at.toString() : '',
        updated_at: student.updated_at ? student.updated_at.toString() : ''
      };
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to fetch student: ${errorMessage}`);
    }
  },

  async deleteStudent(studentId: number) {
    try {
      const student = await sql`SELECT user_id FROM students WHERE id = ${studentId}`;
      if (student.length === 0) {
        throw new Error('Student not found');
      }
      
      const userId = student[0].user_id;
      
      await sql`DELETE FROM students WHERE id = ${studentId}`;
      await sql`DELETE FROM users WHERE id = ${userId}`;
      
      return {
        success: true,
        message: 'Student deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting student:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to delete student: ${errorMessage}`);
    }
  },

  async deactivateStudent(studentId: number) {
    try {
      const result = await sql`
        UPDATE students 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${studentId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        throw new Error('Student not found');
      }
      
      // Also deactivate the associated user account
      await sql`
        UPDATE users 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${result[0].user_id}
      `;
      
      return {
        success: true,
        message: 'Student deactivated successfully'
      };
    } catch (error) {
      console.error('Error deactivating student:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to deactivate student: ${errorMessage}`);
    }
  },

  async reactivateStudent(studentId: number) {
    try {
      const result = await sql`
        UPDATE students 
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${studentId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        throw new Error('Student not found');
      }
      
      // Also reactivate the associated user account
      await sql`
        UPDATE users 
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${result[0].user_id}
      `;
      
      return {
        success: true,
        message: 'Student reactivated successfully'
      };
    } catch (error) {
      console.error('Error reactivating student:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to reactivate student: ${errorMessage}`);
    }
  },

  async updateStudent(studentId: number, studentData: any) {
    try {
      const parseDate = (d: string | null | undefined) => {
        if (!d) return null;
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const result = await sql`
        UPDATE students 
        SET 
          course_id = COALESCE(${studentData.programme_id}, course_id),
          current_class_id = COALESCE(${studentData.current_class_id}, current_class_id),
          surname = COALESCE(${studentData.surname}, surname),
          other_names = COALESCE(${studentData.other_names}, other_names),
          date_of_birth = COALESCE(${parseDate(studentData.date_of_birth)}, date_of_birth),
          gender = COALESCE(${studentData.gender}, gender),
          nationality = COALESCE(${studentData.nationality}, nationality),
          hometown = COALESCE(${studentData.hometown}, hometown),
          district_of_origin = COALESCE(${studentData.district_of_origin}, district_of_origin),
          region_of_origin = COALESCE(${studentData.region_of_origin}, region_of_origin),
          guardian_name = COALESCE(${studentData.guardian_name}, guardian_name),
          guardian_relationship = COALESCE(${studentData.guardian_relationship}, guardian_relationship),
          guardian_phone = COALESCE(${studentData.guardian_phone}, guardian_phone),
          guardian_phone_alt = COALESCE(${studentData.guardian_phone_alt}, guardian_phone_alt),
          guardian_email = COALESCE(${studentData.guardian_email}, guardian_email),
          guardian_address = COALESCE(${studentData.guardian_address}, guardian_address),
          previous_school = COALESCE(${studentData.previous_school}, previous_school),
          graduation_year = COALESCE(${studentData.graduation_year}, graduation_year),
          known_allergies = COALESCE(${studentData.known_allergies}, known_allergies),
          chronic_conditions = COALESCE(${studentData.chronic_conditions}, chronic_conditions),
          blood_group = COALESCE(${studentData.blood_group}, blood_group),
          enrollment_date = COALESCE(${parseDate(studentData.enrollment_date)}, enrollment_date),
          residential_status = COALESCE(${studentData.residential_status}, residential_status),
          house_preference = COALESCE(${studentData.house_preference}, house_preference),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${studentId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        throw new Error('Student not found');
      }
      
      return result[0];
    } catch (error) {
      console.error('Error updating student:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to update student: ${errorMessage}`);
    }
  },

  // Teachers
  async getTeachers(filters?: {
    search?: string;
    department?: string;
    page?: number;
    limit?: number;
    includeInactive?: boolean; // New parameter
  }) {
    const { search, department, page = 1, limit = 10, includeInactive = false } = filters || {};
    
    // Base query condition
    const isActiveCondition = includeInactive ? '' : 'AND t.is_active = true';

    // Use template literals for complex filtering
    if (search) {
      return await sql`
        SELECT t.*, u.user_id
        FROM teachers t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE 1=1 ${sql.unsafe(isActiveCondition)}
        AND (t.surname ILIKE ${`%${search}%`} OR t.other_names ILIKE ${`%${search}%`} OR t.staff_id ILIKE ${`%${search}%`} OR t.department ILIKE ${`%${search}%`} OR t.teacher_id ILIKE ${`%${search}%`})
        ORDER BY t.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
    }
    
    if (department) {
      return await sql`
        SELECT t.*, u.user_id
        FROM teachers t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE 1=1 ${sql.unsafe(isActiveCondition)} AND t.department = ${department}
        ORDER BY t.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
    }
    
    return await sql`
      SELECT t.*, u.user_id
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1 ${sql.unsafe(isActiveCondition)}
      ORDER BY t.created_at DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;
  },

  async createTeacher(teacherData: any) {
    // Generate teacher ID with uniqueness check
    const year = new Date().getFullYear();
    let teacherId;
    let nextTeacherNum = 1;
    let isUnique = false;
    
    while (!isUnique) {
      teacherId = `TEA${year}${nextTeacherNum.toString().padStart(3, '0')}`;
      
      // Check if this ID already exists
      const existingUser = await sql`
        SELECT 1 FROM users WHERE user_id = ${teacherId}
      `;
      
      if (existingUser.length === 0) {
        isUnique = true;
      } else {
        nextTeacherNum++;
      }
    }
    
    // Generate random password
    const tempPassword = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Create user account
    const userResult = await sql`
      INSERT INTO users (user_id, user_type, password_hash, temp_password, must_change_password)
      VALUES (${teacherId}, 'teacher', ${hashedPassword}, ${tempPassword}, true)
      RETURNING id
    `;
    
    const userId = userResult[0].id;
    
    // Create teacher record
    const result = await sql`
      INSERT INTO teachers (
        user_id, teacher_id, staff_id, title, surname, other_names, date_of_birth, gender, 
        nationality, ghana_card_id, employment_date, department, position_rank, 
        staff_type, personal_phone, alt_phone, personal_email, residential_address, 
        highest_qualification, field_of_study, institution, year_obtained, 
        other_qualifications, role, emergency_name, emergency_relationship, emergency_phone, is_active
      ) VALUES (
        ${userId}, ${teacherId}, ${teacherData.staff_id}, ${teacherData.title}, ${teacherData.surname}, 
        ${teacherData.other_names}, ${teacherData.dob || teacherData.date_of_birth}, ${teacherData.gender}, 
        ${teacherData.nationality}, ${teacherData.ghana_card_id}, ${teacherData.employment_date}, 
        ${teacherData.department}, ${teacherData.position_rank}, 
        ${teacherData.staff_type}, ${teacherData.personal_phone}, ${teacherData.alt_phone}, 
        ${teacherData.personal_email}, ${teacherData.residential_address}, ${teacherData.highest_qualification}, 
        ${teacherData.field_of_study}, ${teacherData.institution}, ${teacherData.year_obtained}, 
        ${teacherData.other_qualifications}, ${teacherData.role}, ${teacherData.emergency_name}, 
        ${teacherData.emergency_relationship}, ${teacherData.emergency_phone}, true
      ) RETURNING *
    `;
    
    return {
      ...result[0],
      teacher_id: teacherId,
      password: tempPassword
    };
  },

  async deleteTeacher(teacherId: number) {
    try {
      const teacher = await sql`SELECT user_id FROM teachers WHERE id = ${teacherId}`;
      if (teacher.length === 0) {
        throw new Error('Teacher not found');
      }
      
      const userId = teacher[0].user_id;
      
      await sql`DELETE FROM teachers WHERE id = ${teacherId}`;
      await sql`DELETE FROM users WHERE id = ${userId}`;
      
      return {
        success: true,
        message: 'Teacher deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting teacher:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to delete teacher: ${errorMessage}`);
    }
  },

  async deactivateTeacher(teacherId: number) {
    try {
      const result = await sql`
        UPDATE teachers 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${teacherId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        throw new Error('Teacher not found');
      }
      
      // Also deactivate the associated user account
      await sql`
        UPDATE users 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${result[0].user_id}
      `;
      
      return {
        success: true,
        message: 'Teacher deactivated successfully'
      };
    } catch (error) {
      console.error('Error deactivating teacher:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to deactivate teacher: ${errorMessage}`);
    }
  },

  async reactivateTeacher(teacherId: number) {
    try {
      const result = await sql`
        UPDATE teachers 
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${teacherId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        throw new Error('Teacher not found');
      }
      
      // Also reactivate the associated user account
      await sql`
        UPDATE users 
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${result[0].user_id}
      `;
      
      return {
        success: true,
        message: 'Teacher reactivated successfully'
      };
    } catch (error) {
      console.error('Error reactivating teacher:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to reactivate teacher: ${errorMessage}`);
    }
  },

  async getTeacherById(teacherId: number) {
    try {
      const result = await sql`
        SELECT t.*, u.user_id
        FROM teachers t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.id = ${teacherId}
      `;
      
      if (result.length === 0) {
        throw new Error('Teacher not found');
      }
      
      // Convert date objects to strings to prevent React rendering issues
      const teacher = result[0];
      return {
        ...teacher,
        date_of_birth: teacher.date_of_birth ? teacher.date_of_birth.toString() : '',
        employment_date: teacher.employment_date ? teacher.employment_date.toString() : '',
        created_at: teacher.created_at ? teacher.created_at.toString() : '',
        updated_at: teacher.updated_at ? teacher.updated_at.toString() : ''
      };
    } catch (error) {
      console.error('Error fetching teacher by ID:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to fetch teacher: ${errorMessage}`);
    }
  },

  async updateTeacher(teacherId: number, teacherData: any) {
    try {
      const result = await sql`
        UPDATE teachers 
        SET 
          department = COALESCE(${teacherData.department}, department),
          position_rank = COALESCE(${teacherData.position_rank}, position_rank),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${teacherId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        throw new Error('Teacher not found');
      }
      
      return result[0];
    } catch (error) {
      console.error('Error updating teacher:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to update teacher: ${errorMessage}`);
    }
  },

  // Courses and Classes (updated from programmes)
  async getCourses() {
    return await sql`SELECT * FROM courses WHERE is_active = true ORDER BY name`;
  },

  async createCourse(courseData: any) {
    const result = await sql`
      INSERT INTO courses (name, code, description, duration_years)
      VALUES (${courseData.name}, ${courseData.code}, ${courseData.description}, ${courseData.duration_years})
      RETURNING *
    `;
    return result[0];
  },
  async getClasses(courseId?: number, form?: number, semester?: number) {
    let query = sql`SELECT * FROM classes WHERE is_active = true`;
    
    if (courseId) {
      query = sql`SELECT * FROM classes WHERE course_id = ${courseId} AND is_active = true`;
    }
    
    if (form) {
      query = sql`${query} AND form = ${form}`;
    }
    
    if (semester) {
      query = sql`${query} AND semester = ${semester}`;
    }
    
    query = sql`${query} ORDER BY form, semester, stream`;
    
    return await query;
  },
  async getClassWithSubjects(classId?: number, courseId?: number, form?: number, semester?: number) {
    if (classId) {
       const classInfo = await sql`
        SELECT c.*, 
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', s.id,
                     'name', s.name,
                     'code', s.code,
                     'is_core', s.is_core,
                     'is_elective', cs.is_elective
                   )
                 ) FILTER (WHERE s.id IS NOT NULL), 
                 '[]'::json
               ) as subjects
        FROM classes c
        LEFT JOIN class_subjects cs ON c.id = cs.class_id
        LEFT JOIN subjects s ON cs.subject_id = s.id
        WHERE c.id = ${classId}
        GROUP BY c.id
      `;
      return classInfo[0];
    }
    
    let query = sql`
      SELECT c.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', s.id,
                   'name', s.name,
                   'code', s.code,
                   'is_core', s.is_core,
                   'is_elective', cs.is_elective
                 )
               ) FILTER (WHERE s.id IS NOT NULL), 
               '[]'::json
             ) as subjects
      FROM classes c
      LEFT JOIN class_subjects cs ON c.id = cs.class_id
      LEFT JOIN subjects s ON cs.subject_id = s.id
      WHERE c.is_active = true`;
    
    if (courseId) {
      query = sql`${query} AND c.course_id = ${courseId}`;
    }
    
    if (form) {
      query = sql`${query} AND c.form = ${form}`;
    }
    
    if (semester) {
      query = sql`${query} AND c.semester = ${semester}`;
    }
    
    query = sql`${query} GROUP BY c.id ORDER BY c.form, c.semester, c.stream`;
    
    const classes = await query;
    return classes;
  },
  async findOrCreateClassForElectives(courseId: number, electiveSubjectIds: number[], form: number = 1, semester: number = 1) {
    try {
      // Validate inputs
      if (!courseId || !electiveSubjectIds || electiveSubjectIds.length === 0) {
        throw new Error('Course ID and elective subject IDs are required');
      }
      
      // Ensure all subject IDs are valid numbers
      const validSubjectIds = electiveSubjectIds.filter(id => !isNaN(id));
      if (validSubjectIds.length !== electiveSubjectIds.length) {
        throw new Error('Invalid subject IDs provided');
      }
      
      // Find existing class with the same elective combination, form, and semester
      const classesWithSubjects = await sql`
        SELECT c.id, c.class_name, c.form, c.semester, c.stream
        FROM classes c
        JOIN class_subjects cs ON c.id = cs.class_id
        WHERE c.course_id = ${courseId} 
        AND c.form = ${form}
        AND c.semester = ${semester}
        AND cs.subject_id = ANY(${validSubjectIds})
        GROUP BY c.id, c.class_name, c.form, c.semester, c.stream
        HAVING COUNT(DISTINCT cs.subject_id) = ${validSubjectIds.length}
      `;

      if (classesWithSubjects.length > 0) {
        // Return the first matching class
        return classesWithSubjects[0];
      }

      // If no class exists with this combination, create one
      // Get course name
      const courseResult = await sql`SELECT name FROM courses WHERE id = ${courseId}`;
      const courseName = courseResult[0]?.name || 'Course';
      
      // Get subject names for class naming
      const subjectsResult = await sql`
        SELECT name FROM subjects WHERE id = ANY(${validSubjectIds})
      `;
      
      const subjectNames = subjectsResult.map((s: any) => s.name).join('-');
      
      // Generate class name
      const className = `${courseName.split(' ')[0]} ${form} ${subjectNames} S${semester}`;
      
      // Get next available stream
      const streamResult = await sql`
        SELECT COALESCE(MAX(stream), 'A') as max_stream 
        FROM classes 
        WHERE course_id = ${courseId} AND form = ${form} AND semester = ${semester}
      `;
      
      const currentStream = streamResult[0]?.max_stream || 'A';
      let nextStream = 'A';
      
      // Only increment if currentStream is a valid letter
      if (currentStream && /^[A-Z]$/i.test(currentStream)) {
        nextStream = String.fromCharCode(currentStream.charCodeAt(0) + 1);
      }
      
      // Create the new class
      const classResult = await sql`
        INSERT INTO classes (class_name, course_id, form, semester, stream, academic_year)
        VALUES (${className}, ${courseId}, ${form}, ${semester}, ${nextStream}, ${new Date().getFullYear() + '/' + (new Date().getFullYear() + 1)})
        RETURNING *
      `;
      
      const newClass = classResult[0];
      
      // Create subject relationships
      for (const subjectId of validSubjectIds) {
        await sql`
          INSERT INTO class_subjects (class_id, subject_id, is_elective)
          VALUES (${newClass.id}, ${subjectId}, true)
          ON CONFLICT DO NOTHING
        `;
      }
      
      return newClass;
    } catch (error) {
      console.error('Error finding or creating class for electives:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to find or create class: ${errorMessage}`);
    }
  },
  async createClass(classData: any) {
    try {
      // Validate required fields
      if (!classData.class_name || !classData.course_id || !classData.form) {
        throw new Error('Class name, course ID, and form are required');
      }
      
      // Create the class first
      const result = await sql`
        INSERT INTO classes (class_name, course_id, form, semester, stream, academic_year, capacity)
        VALUES (${classData.class_name}, ${classData.course_id}, ${classData.form}, ${classData.semester || 1}, ${classData.stream || null}, ${classData.academic_year}, ${classData.capacity || 40})
        RETURNING *
      `;
      
      const createdClass = result[0];
      
      // If elective subjects are provided, store the class-subject relationships
      if (classData.elective_subject_1 || classData.elective_subject_2 || classData.elective_subject_3 || classData.elective_subject_4) {
        const electiveSubjects = [
          classData.elective_subject_1,
          classData.elective_subject_2,
          classData.elective_subject_3,
          classData.elective_subject_4
        ].filter(id => id && id !== ''); // Remove empty values
        
        // Insert class-subject relationships for electives
        for (const subjectId of electiveSubjects) {
          // Validate subject ID
          const subjectIdNum = parseInt(subjectId);
          if (isNaN(subjectIdNum)) {
            console.warn(`Invalid subject ID: ${subjectId}`);
            continue;
          }
          
          await sql`
            INSERT INTO class_subjects (class_id, subject_id, is_elective)
            VALUES (${createdClass.id}, ${subjectIdNum}, true)
            ON CONFLICT (class_id, subject_id) DO NOTHING
          `;
        }
      }
      
      return createdClass;
    } catch (error) {
      console.error('Error creating class:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to create class: ${errorMessage}`);
    }
  },
  async deleteAllClasses() {
    try {
      // First, update any students who are assigned to classes to have null class_id
      await sql`UPDATE students SET current_class_id = NULL WHERE current_class_id IS NOT NULL`;
      
      // Delete all teacher-subject-class relationships
      await sql`DELETE FROM teacher_subjects`;
      
      // Delete all classes
      const result = await sql`DELETE FROM classes RETURNING *`;
      
      return {
        success: true,
        deletedCount: result.length,
        message: `Successfully deleted ${result.length} classes`
      };
    } catch (error) {
      console.error('Error deleting classes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to delete classes: ${errorMessage}`);
    }
  },
  async deleteClass(classId: number) {
    try {
      // Update students who are in this class
      await sql`UPDATE students SET current_class_id = NULL WHERE current_class_id = ${classId}`;
      
      // Delete teacher-subject relationships for this class
      await sql`DELETE FROM teacher_subjects WHERE class_id = ${classId}`;
      
      // Delete the class
      const result = await sql`DELETE FROM classes WHERE id = ${classId} RETURNING *`;
      
      if (result.length === 0) {
        throw new Error('Class not found');
      }
      
      return {
        success: true,
        message: 'Class deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting class:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to delete class: ${errorMessage}`);
    }
  },
  async getSubjects(courseId?: number) {
    if (courseId) {
      return await sql`
        SELECT * FROM subjects 
        WHERE (course_id = ${courseId} OR course_id IS NULL) AND is_active = true 
        ORDER BY is_core DESC, name
      `;
    }
    return await sql`SELECT * FROM subjects WHERE is_active = true ORDER BY is_core DESC, name`;
  },
  async createSubject(subjectData: any) {
    const result = await sql`
      INSERT INTO subjects (name, code, course_id, is_core)
      VALUES (${subjectData.name}, ${subjectData.code}, ${subjectData.course_id}, ${subjectData.is_core})
      RETURNING *
    `;
    return result[0];
  },
  async updateElectiveSubjects() {
    try {
      // Remove all existing elective subjects (keep core subjects)
      await sql`DELETE FROM subjects WHERE is_core = false`;
      
      // 1. General Arts electives
      await sql`
        INSERT INTO subjects (name, code, course_id, is_core) VALUES 
        ('Literature in English', 'LIT_ENG', 1, false),
        ('History', 'HIST', 1, false),
        ('Geography', 'GEOG', 1, false),
        ('Government', 'GOV', 1, false),
        ('Economics', 'ECON_GA', 1, false),
        ('Christian Religious Studies (CRS)', 'CRS', 1, false),
        ('Elective Mathematics', 'MATH_E_GA', 1, false),
        ('Ghanaian Language (Akwapim Twi)', 'TWI', 1, false),
        ('French', 'FRENCH', 1, false)
      `;
      
      // 2. General Science electives
      await sql`
        INSERT INTO subjects (name, code, course_id, is_core) VALUES 
        ('Physics', 'PHYS', 3, false),
        ('Chemistry', 'CHEM', 3, false),
        ('Biology', 'BIO', 3, false),
        ('Elective Mathematics', 'MATH_E_GS', 3, false),
        ('Information and Communication Technology (ICT)', 'ICT_GS', 3, false)
      `;
      
      // 3. Business electives
      await sql`
        INSERT INTO subjects (name, code, course_id, is_core) VALUES 
        ('Financial Accounting', 'FIN_ACC', 2, false),
        ('Costing', 'COST', 2, false),
        ('Business Management', 'BUS_MGT', 2, false),
        ('Economics', 'ECON_BUS', 2, false),
        ('Elective Mathematics', 'MATH_E_BUS', 2, false)
      `;
      
      // 4. Visual Arts electives
      await sql`
        INSERT INTO subjects (name, code, course_id, is_core) VALUES 
        ('General Knowledge in Art', 'GEN_ART', 4, false),
        ('Information and Communication Technology (ICT)', 'ICT_VA', 4, false),
        ('Graphic Design', 'GRAPH_DES', 4, false),
        ('Picture Making', 'PIC_MAK', 4, false),
        ('Sculpture', 'SCULP', 4, false)
      `;
      
      // 5. Home Economics electives
      await sql`
        INSERT INTO subjects (name, code, course_id, is_core) VALUES 
        ('Management in Living', 'MGT_LIV', 6, false),
        ('Food and Nutrition', 'FOOD_NUT', 6, false),
        ('Clothing and Textiles', 'CLOTH_TEXT', 6, false),
        ('Biology', 'BIO_HE', 6, false),
        ('General Knowledge in Art', 'GEN_ART_HE', 6, false)
      `;
      
      // 6. Agricultural Science electives
      await sql`
        INSERT INTO subjects (name, code, course_id, is_core) VALUES 
        ('General Agriculture', 'GEN_AGRIC', 5, false),
        ('Chemistry', 'CHEM_AG', 5, false),
        ('Animal Husbandry', 'ANIM_HUS', 5, false),
        ('Elective Mathematics', 'MATH_E_AG', 5, false)
      `;
      
      // Update course names to match curriculum
      await sql`UPDATE courses SET name = 'General Art' WHERE id = 1`;
      await sql`UPDATE courses SET name = 'Business' WHERE id = 2`;
      await sql`UPDATE courses SET name = 'General Science' WHERE id = 3`;
      await sql`UPDATE courses SET name = 'Visual Art' WHERE id = 4`;
      await sql`UPDATE courses SET name = 'Agricultural Science' WHERE id = 5`;
      await sql`UPDATE courses SET name = 'Home Economics' WHERE id = 6`;
      
      return {
        success: true,
        message: 'Elective subjects updated successfully according to Ghana curriculum'
      };
    } catch (error) {
      console.error('Error updating elective subjects:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to update elective subjects: ${errorMessage}`);
    }
  },

  // Teacher-Subject Assignment
  async assignSubjectToTeacher(teacherId: number, subjectId: number, classId: number) {
    try {
      const academicYear = new Date().getFullYear() + '/' + (new Date().getFullYear() + 1);
      
      const result = await sql`
        INSERT INTO teacher_subjects (teacher_id, subject_id, class_id, academic_year)
        VALUES (${teacherId}, ${subjectId}, ${classId}, ${academicYear})
        ON CONFLICT (teacher_id, subject_id, class_id, academic_year) DO NOTHING
        RETURNING *
      `;
      
      if (result.length === 0) {
        return { alreadyAssigned: true };
      }
      
      return result[0];
    } catch (error) {
      console.error('Error assigning subject to teacher:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to assign subject to teacher: ${errorMessage}`);
    }
  },

  async getTeacherSubjects(teacherId: number) {
    try {
      const result = await sql`
        SELECT ts.*, s.name as subject_name, c.class_name, c.form, c.stream, c.id as class_id, s.id as subject_id
        FROM teacher_subjects ts
        JOIN subjects s ON ts.subject_id = s.id
        JOIN classes c ON ts.class_id = c.id
        WHERE ts.teacher_id = ${teacherId} AND ts.is_active = true
        ORDER BY c.form, c.stream, s.name
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching teacher subjects:', error);
      return [];
    }
  },

  async removeTeacherSubject(assignmentId: number) {
    try {
      await sql`
        DELETE FROM teacher_subjects WHERE id = ${assignmentId}
      `;
      return { success: true };
    } catch (error) {
      console.error('Error removing teacher subject:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to remove subject assignment: ${errorMessage}`);
    }
  },

  // Announcements
  async getAnnouncements(classId?: number) {
    try {
      let result;
      if (classId) {
        // Get announcements for a specific class (for teachers)
        result = await sql`
          SELECT *
          FROM announcements
          WHERE (target_class_id = ${classId} OR target_class_id IS NULL) AND is_published = true
          ORDER BY created_at DESC
        `;
      } else {
        // Get all announcements (for admins)
        result = await sql`
          SELECT *
          FROM announcements
          WHERE is_published = true
          ORDER BY created_at DESC
        `;
      }
      return result || [];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },

  async createAnnouncement(announcementData: { 
    title: string; 
    content: string; 
    created_by: number;
    class_id?: number; // Optional class ID for teacher announcements
  }) {
    try {
      const result = await sql`
        INSERT INTO announcements (title, content, created_by, class_id)
        VALUES (${announcementData.title}, ${announcementData.content}, ${announcementData.created_by}, ${announcementData.class_id || null})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw new Error('Failed to create announcement');
    }
  },

  async deleteAnnouncement(announcementId: number) {
    try {
      const result = await sql`
        UPDATE announcements 
        SET is_published = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${announcementId}
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw new Error('Failed to delete announcement');
    }
  },

  // Timetables
  async uploadTimetable(timetableData: { 
    class_id: number; 
    file_name: string; 
    file_path: string; 
    file_type: string; 
    academic_year: string; 
    uploaded_by: number 
  }) {
    try {
      const result = await sql`
        INSERT INTO timetables (class_id, file_name, file_path, file_type, academic_year, uploaded_by)
        VALUES (${timetableData.class_id}, ${timetableData.file_name}, ${timetableData.file_path}, 
                ${timetableData.file_type}, ${timetableData.academic_year}, ${timetableData.uploaded_by})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error uploading timetable:', error);
      throw new Error('Failed to upload timetable');
    }
  },

  async getTimetables(classId?: number) {
    try {
      if (classId) {
        return await sql`
          SELECT t.*, c.class_name, u.user_id as uploaded_by_user
          FROM timetables t
          JOIN classes c ON t.class_id = c.id
          JOIN users u ON t.uploaded_by = u.id
          WHERE t.class_id = ${classId} AND t.is_active = true
          ORDER BY t.created_at DESC
        `;
      }
      
      return await sql`
        SELECT t.*, c.class_name, u.user_id as uploaded_by_user
        FROM timetables t
        JOIN classes c ON t.class_id = c.id
        JOIN users u ON t.uploaded_by = u.id
        WHERE t.is_active = true
        ORDER BY c.class_name, t.created_at DESC
      `;
    } catch (error) {
      console.error('Error fetching timetables:', error);
      return [];
    }
  },

  async deleteTimetable(timetableId: number) {
    try {
      const result = await sql`
        UPDATE timetables 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${timetableId}
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error deleting timetable:', error);
      throw new Error('Failed to delete timetable');
    }
  },

  // Timetable Entries
  async createTimetableEntry(entryData: { 
    day: string;
    time_slot: string;
    class_id: number;
    subject_id: number;
    teacher_id: number;
    academic_year: string;
  }) {
    try {
      const result = await sql`
        INSERT INTO timetable_entries (day, time_slot, class_id, subject_id, teacher_id, academic_year)
        VALUES (${entryData.day}, ${entryData.time_slot}, ${entryData.class_id}, ${entryData.subject_id}, ${entryData.teacher_id}, ${entryData.academic_year})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error creating timetable entry:', error);
      throw new Error('Failed to create timetable entry');
    }
  },

  async getTimetableEntries(filters?: { 
    class_id?: number;
    subject_id?: number;
    teacher_id?: number;
    academic_year?: string;
    day?: string;
  }) {
    try {
      let query = sql`SELECT te.*, c.class_name, s.name as subject_name, t.surname as teacher_surname, t.other_names as teacher_other_names
                     FROM timetable_entries te
                     JOIN classes c ON te.class_id = c.id
                     JOIN subjects s ON te.subject_id = s.id
                     JOIN teachers t ON te.teacher_id = t.id
                     WHERE te.is_active = true`;
      
      if (filters?.class_id) {
        query = sql`${query} AND te.class_id = ${filters.class_id}`;
      }
      
      if (filters?.subject_id) {
        query = sql`${query} AND te.subject_id = ${filters.subject_id}`;
      }
      
      if (filters?.teacher_id) {
        query = sql`${query} AND te.teacher_id = ${filters.teacher_id}`;
      }
      
      if (filters?.academic_year) {
        query = sql`${query} AND te.academic_year = ${filters.academic_year}`;
      }
      
      if (filters?.day) {
        query = sql`${query} AND te.day = ${filters.day}`;
      }
      
      query = sql`${query} ORDER BY te.day, te.time_slot`;
      
      return await query;
    } catch (error) {
      console.error('Error fetching timetable entries:', error);
      return [];
    }
  },

  async getTeacherTimetable(teacherId: number, academicYear: string) {
    try {
      const result = await sql`
        SELECT te.*, c.class_name, s.name as subject_name
        FROM timetable_entries te
        JOIN classes c ON te.class_id = c.id
        JOIN subjects s ON te.subject_id = s.id
        WHERE te.teacher_id = ${teacherId} 
        AND te.academic_year = ${academicYear}
        AND te.is_active = true
        ORDER BY te.day, te.time_slot
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching teacher timetable:', error);
      return [];
    }
  },

  async getClassTimetable(classId: number, academicYear: string) {
    try {
      const result = await sql`
        SELECT te.*, s.name as subject_name, t.surname as teacher_surname, t.other_names as teacher_other_names
        FROM timetable_entries te
        JOIN subjects s ON te.subject_id = s.id
        JOIN teachers t ON te.teacher_id = t.id
        WHERE te.class_id = ${classId} 
        AND te.academic_year = ${academicYear}
        AND te.is_active = true
        ORDER BY te.day, te.time_slot
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching class timetable:', error);
      return [];
    }
  },

  async deleteTimetableEntries(academicYear: string) {
    try {
      const result = await sql`
        UPDATE timetable_entries 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE academic_year = ${academicYear}
        RETURNING *
      `;
      
      return result;
    } catch (error) {
      console.error('Error deleting timetable entries:', error);
      throw new Error('Failed to delete timetable entries');
    }
  },

  async getUserByEmail(email: string) {
    // This is kept for admin login compatibility
    const result = await sql`
      SELECT * FROM users WHERE user_id = ${email} AND user_type = 'admin' AND is_active = true
    `;
    return result[0] || null;
  },

  async getStudentSubjects(studentId: number) {
    try {
      // Get student's class and course info
      const student = await sql`
        SELECT s.current_class_id, c.course_id, c.class_name
        FROM students s
        LEFT JOIN classes c ON s.current_class_id = c.id
        WHERE s.id = ${studentId}
      `;
      if (student.length === 0) return [];

      const { current_class_id, course_id, class_name } = student[0];

      // Merge subjects from all sources, deduplicated by subject_id
      const seen = new Set<number>();
      const allSubjects: any[] = [];

      // 1. Core subjects for the student's course
      const coreSubjects = await sql`
        SELECT s.id as subject_id, s.name as subject_name, s.code as subject_code,
               s.is_core, ${class_name} as class_name
        FROM subjects s
        WHERE s.course_id = ${course_id} AND s.is_core = true AND s.is_active = true
      `;
      for (const sub of coreSubjects) {
        if (!seen.has(sub.subject_id)) {
          seen.add(sub.subject_id);
          allSubjects.push(sub);
        }
      }

      // 2. Elective subjects for the student's class
      const electiveSubjects = await sql`
        SELECT s.id as subject_id, s.name as subject_name, s.code as subject_code,
               s.is_core, ${class_name} as class_name
        FROM class_subjects cs
        JOIN subjects s ON cs.subject_id = s.id
        WHERE cs.class_id = ${current_class_id} AND s.is_active = true
      `;
      for (const sub of electiveSubjects) {
        if (!seen.has(sub.subject_id)) {
          seen.add(sub.subject_id);
          allSubjects.push(sub);
        }
      }

      // 3. Any extra subjects from student_subjects (custom enrollments)
      const extraSubjects = await sql`
        SELECT s.id as subject_id, s.name as subject_name, s.code as subject_code,
               s.is_core, ${class_name} as class_name
        FROM student_subjects ss
        JOIN subjects s ON ss.subject_id = s.id
        WHERE ss.student_id = ${studentId} AND ss.is_active = true
      `;
      for (const sub of extraSubjects) {
        if (!seen.has(sub.subject_id)) {
          seen.add(sub.subject_id);
          allSubjects.push(sub);
        }
      }

      allSubjects.sort((a: any, b: any) => a.subject_name?.localeCompare(b.subject_name));
      return allSubjects;
    } catch (error) {
      console.error('Error fetching student subjects:', error);
      return [];
    }
  },

  async promoteStudentsToNextForm(currentAcademicYear: string, targetAcademicYear: string, fromForm: number = 1, fromSemester: number = 2, toForm: number = (fromForm + 1), toSemester: number = 1) {
    try {
      // Get all students in the specified form and semester
      const studentsToPromote = await sql`
        SELECT s.*, c.form as current_form, c.semester as current_semester
        FROM students s
        JOIN classes c ON s.current_class_id = c.id
        WHERE c.form = ${fromForm} AND c.semester = ${fromSemester} AND s.is_active = true
      `;

      // For each student, find or create a corresponding class in the next form/semester
      for (const student of studentsToPromote) {
        // Get the current class information
        const currentClass = await sql`
          SELECT * FROM classes WHERE id = ${student.current_class_id}
        `;

        if (currentClass.length > 0) {
          const classInfo = currentClass[0];
          
          // Check if a target class already exists with the same parameters
          let targetClassName;
          if (fromSemester === 2 && toSemester === 1) {
            // Moving from semester 2 to next form semester 1
            targetClassName = classInfo.class_name.replace(`${fromForm} S2`, `${toForm} S1`);
          } else if (fromSemester === 1 && toSemester === 2) {
            // Moving from semester 1 to semester 2 (same form)
            targetClassName = classInfo.class_name.replace(`${fromForm} S1`, `${toForm} S2`);
          } else {
            // Default pattern
            targetClassName = classInfo.class_name.replace(`${fromForm}`, `${toForm}`).replace(`S${fromSemester}`, `S${toSemester}`);
          }
          
          const existingTargetClass = await sql`
            SELECT * FROM classes 
            WHERE class_name = ${targetClassName} 
            AND course_id = ${classInfo.course_id}
            AND form = ${toForm}
            AND semester = ${toSemester}
            AND academic_year = ${targetAcademicYear}
          `;

          let targetClassId;
          if (existingTargetClass.length > 0) {
            // Use existing target class
            targetClassId = existingTargetClass[0].id;
          } else {
            // Create new target class with same parameters
            const newClassResult = await sql`
              INSERT INTO classes (class_name, course_id, form, semester, stream, academic_year, capacity)
              VALUES (${targetClassName}, ${classInfo.course_id}, ${toForm}, ${toSemester}, ${classInfo.stream}, ${targetAcademicYear}, ${classInfo.capacity})
              RETURNING id
            `;
            targetClassId = newClassResult[0].id;
            
            // Copy subject relationships if they exist
            const subjectRelationships = await sql`
              SELECT * FROM class_subjects WHERE class_id = ${classInfo.id}
            `;
            
            for (const rel of subjectRelationships) {
              await sql`
                INSERT INTO class_subjects (class_id, subject_id, is_elective)
                VALUES (${targetClassId}, ${rel.subject_id}, ${rel.is_elective})
                ON CONFLICT DO NOTHING
              `;
            }
          }

          // Update student to target class
          await sql`
            UPDATE students 
            SET current_class_id = ${targetClassId}
            WHERE id = ${student.id}
          `;
        }
      }

      return {
        success: true,
        message: `Successfully promoted ${studentsToPromote.length} students from Form ${fromForm} Semester ${fromSemester} to Form ${toForm} Semester ${toSemester}`
      };
    } catch (error) {
      console.error('Error promoting students:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to promote students: ${errorMessage}`);
    }
  },

  // Add new functions for teacher portal
  async getClassStudents(classId: number) {
    try {
      const result = await sql`
        SELECT s.*, c.class_name
        FROM students s
        JOIN classes c ON s.current_class_id = c.id
        WHERE s.current_class_id = ${classId} AND s.is_active = true
        ORDER BY s.surname, s.other_names
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching class students:', error);
      return [];
    }
  },

  async getAssignmentTypes() {
    try {
      const result = await sql`
        SELECT * FROM assignment_types
        ORDER BY id
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching assignment types:', error);
      return [];
    }
  },

  async createAssignment(assignmentData: any) {
    try {
      const result = await sql`
        INSERT INTO assignments (teacher_id, class_id, subject_id, title, description, assignment_type_id, due_date, max_score, submission_type)
        VALUES (${assignmentData.teacher_id}, ${assignmentData.class_id}, ${assignmentData.subject_id}, 
                ${assignmentData.title}, ${assignmentData.description}, ${assignmentData.assignment_type_id}, 
                ${assignmentData.due_date}, ${assignmentData.max_score}, ${assignmentData.submission_type})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw new Error('Failed to create assignment');
    }
  },

  async getAssignmentsByTeacher(teacherId: number) {
    try {
      const result = await sql`
        SELECT a.*, c.class_name, s.name as subject_name, at.name as assignment_type
        FROM assignments a
        JOIN classes c ON a.class_id = c.id
        JOIN subjects s ON a.subject_id = s.id
        JOIN assignment_types at ON a.assignment_type_id = at.id
        WHERE a.teacher_id = ${teacherId} AND a.is_active = true AND a.is_general_exam IS NOT TRUE
        ORDER BY a.created_at DESC
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching teacher assignments:', error);
      return [];
    }
  },

  async getAssignmentsByClass(classId: number) {
    try {
      const result = await sql`
        SELECT a.*, c.class_name, s.name as subject_name, at.name as assignment_type
        FROM assignments a
        JOIN classes c ON a.class_id = c.id
        JOIN subjects s ON a.subject_id = s.id
        JOIN assignment_types at ON a.assignment_type_id = at.id
        WHERE a.class_id = ${classId} AND a.is_active = true AND a.is_general_exam IS NOT TRUE
        ORDER BY a.created_at DESC
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching class assignments:', error);
      return [];
    }
  },

  async submitAssignment(assignmentId: number, studentId: number, filePath?: string) {
    try {
      const result = await sql`
        INSERT INTO assignment_submissions (assignment_id, student_id, file_path)
        VALUES (${assignmentId}, ${studentId}, ${filePath || null})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw new Error('Failed to submit assignment');
    }
  },

  async getAssignmentSubmissions(assignmentId: number) {
    try {
      const result = await sql`
        SELECT ass.*, s.student_id, s.surname, s.other_names, c.class_name
        FROM assignment_submissions ass
        JOIN students s ON ass.student_id = s.id
        JOIN classes c ON s.current_class_id = c.id
        WHERE ass.assignment_id = ${assignmentId} AND ass.is_active = true
        ORDER BY s.surname, s.other_names
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching assignment submissions:', error);
      return [];
    }
  },

  async getStudentSubmissionForAssignment(assignmentId: number, studentId: number) {
    try {
      const result = await sql`
        SELECT * FROM assignment_submissions
        WHERE assignment_id = ${assignmentId} AND student_id = ${studentId}
        LIMIT 1
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching student submission:', error);
      return null;
    }
  },

  async gradeAssignmentSubmission(submissionId: number, score: number, remarks: string, teacherId: number) {
    try {
      const result = await sql`
        UPDATE assignment_submissions 
        SET score = ${score}, remarks = ${remarks}, graded_by = ${teacherId}, graded_date = CURRENT_TIMESTAMP
        WHERE id = ${submissionId}
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error grading assignment:', error);
      throw new Error('Failed to grade assignment');
    }
  },

  async getStudentBehaviorRecords(studentId: number) {
    try {
      const result = await sql`
        SELECT *
        FROM student_behavior_records
        WHERE student_id = ${studentId} AND is_active = true
        ORDER BY date DESC
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching student behavior records:', error);
      return [];
    }
  },

  async getAllBehaviorRecords() {
    try {
      const result = await sql`
        SELECT sbr.*, 
               s.surname as student_surname, 
               s.other_names as student_other_names,
               t.surname as teacher_surname,
               t.other_names as teacher_other_names
        FROM student_behavior_records sbr
        JOIN students s ON sbr.student_id = s.id
        LEFT JOIN teachers t ON sbr.recorded_by = t.id
        WHERE sbr.is_active = true
        ORDER BY sbr.date DESC
      `;
      
      return result.map((record: any) => ({
        ...record,
        student_name: `${record.student_surname} ${record.student_other_names}`,
        teacher_name: record.teacher_surname ? `${record.teacher_surname} ${record.teacher_other_names}` : 'System'
      }));
    } catch (error) {
      console.error('Error fetching all behavior records:', error);
      return [];
    }
  },

  async createBehaviorRecord(recordData: any) {
    try {
      const result = await sql`
        INSERT INTO student_behavior_records 
        (student_id, recorded_by, date, type, description, status)
        VALUES (${recordData.student_id}, ${recordData.recorded_by}, ${recordData.date}, 
                ${recordData.type}, ${recordData.description}, ${recordData.status})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error creating behavior record:', error);
      throw new Error('Failed to create behavior record');
    }
  },

  async updateBehaviorRecord(id: number, recordData: any) {
    try {
      const result = await sql`
        UPDATE student_behavior_records
        SET student_id = ${recordData.student_id},
            recorded_by = ${recordData.recorded_by},
            date = ${recordData.date},
            type = ${recordData.type},
            description = ${recordData.description},
            status = ${recordData.status},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error updating behavior record:', error);
      throw new Error('Failed to update behavior record');
    }
  },

  async deleteBehaviorRecord(id: number) {
    try {
      const result = await sql`
        UPDATE student_behavior_records
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error deleting behavior record:', error);
      throw new Error('Failed to delete behavior record');
    }
  },

  async saveStudentResult(resultData: any) {
    try {
      // Check if result already exists
      const existingResult = await sql`
        SELECT id FROM student_results
        WHERE student_id = ${resultData.student_id} 
        AND subject_id = ${resultData.subject_id}
        AND academic_year = ${resultData.academic_year}
        AND term = ${resultData.term}
      `;

      if (existingResult.length > 0) {
        // Update existing result
        const result = await sql`
          UPDATE student_results
          SET class_score = ${resultData.class_score}, 
              exam_score = ${resultData.exam_score},
              total_score = ${resultData.total_score},
              grade = ${resultData.grade},
              remarks = ${resultData.remarks},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${existingResult[0].id}
          RETURNING *
        `;
        
        return result[0];
      } else {
        // Insert new result
        const result = await sql`
          INSERT INTO student_results (student_id, subject_id, class_id, academic_year, term, 
                                     class_score, exam_score, total_score, grade, remarks)
          VALUES (${resultData.student_id}, ${resultData.subject_id}, ${resultData.class_id}, 
                  ${resultData.academic_year}, ${resultData.term}, ${resultData.class_score}, 
                  ${resultData.exam_score}, ${resultData.total_score}, ${resultData.grade}, ${resultData.remarks})
          RETURNING *
        `;
        
        return result[0];
      }
    } catch (error) {
      console.error('Error saving student result:', error);
      throw new Error('Failed to save student result');
    }
  },

  async getStudentResults(studentId: number, academicYear?: string, term?: number) {
    try {
      let query = sql`
        SELECT sr.*, s.name as subject_name, c.class_name
        FROM student_results sr
        JOIN subjects s ON sr.subject_id = s.id
        JOIN classes c ON sr.class_id = c.id
        WHERE sr.student_id = ${studentId} AND sr.is_active = true
      `;
      
      if (academicYear) {
        query = sql`${query} AND sr.academic_year = ${academicYear}`;
      }
      
      if (term) {
        query = sql`${query} AND sr.term = ${term}`;
      }
      
      query = sql`${query} ORDER BY sr.academic_year DESC, sr.term, s.name`;
      
      return await query;
    } catch (error) {
      console.error('Error fetching student results:', error);
      return [];
    }
  },

  async getClassResults(classId: number, subjectId: number, academicYear: string, term: number) {
    try {
      const result = await sql`
        SELECT sr.*, s.student_id, s.surname, s.other_names
        FROM student_results sr
        JOIN students s ON sr.student_id = s.id
        WHERE sr.class_id = ${classId} 
        AND sr.subject_id = ${subjectId}
        AND sr.academic_year = ${academicYear}
        AND sr.term = ${term}
        AND sr.is_active = true
        AND s.is_active = true
        ORDER BY s.surname, s.other_names
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching class results:', error);
      return [];
    }
  },

  async getTeacherMessages(teacherId: number) {
    try {
      const result = await sql`
        SELECT tm.*, c.class_name, s.name as subject_name
        FROM teacher_messages tm
        LEFT JOIN classes c ON tm.class_id = c.id
        LEFT JOIN subjects s ON tm.subject_id = s.id
        WHERE tm.teacher_id = ${teacherId} AND tm.is_active = true
        ORDER BY tm.created_at DESC
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching teacher messages:', error);
      return [];
    }
  },

  async createTeacherMessage(messageData: any) {
    try {
      const result = await sql`
        INSERT INTO teacher_messages (teacher_id, class_id, subject_id, title, content, is_private, recipient_student_id)
        VALUES (${messageData.teacher_id}, ${messageData.class_id}, ${messageData.subject_id}, 
                ${messageData.title}, ${messageData.content}, ${messageData.is_private || false}, 
                ${messageData.recipient_student_id || null})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error creating teacher message:', error);
      throw new Error('Failed to create teacher message');
    }
  },

  async getStudentPerformanceHistory(studentId: number, subjectId: number) {
    try {
      const result = await sql`
        SELECT sr.*, c.class_name
        FROM student_results sr
        JOIN classes c ON sr.class_id = c.id
        WHERE sr.student_id = ${studentId} 
        AND sr.subject_id = ${subjectId}
        AND sr.is_active = true
        ORDER BY sr.academic_year, sr.term
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching student performance history:', error);
      return [];
    }
  },

  // New functions for overall student performance analytics
  async getTopStudents(limit: number = 10, academicYear?: string, term?: number) {
    try {
      let query = sql`
        SELECT 
          s.id,
          s.student_id,
          s.surname,
          s.other_names,
          c.class_name,
          AVG(sr.total_score) as average_score,
          COUNT(sr.id) as subjects_count
        FROM students s
        JOIN student_results sr ON s.id = sr.student_id
        JOIN classes c ON s.current_class_id = c.id
        WHERE s.is_active = true AND sr.is_active = true
      `;
      
      if (academicYear) {
        query = sql`${query} AND sr.academic_year = ${academicYear}`;
      }
      
      if (term) {
        query = sql`${query} AND sr.term = ${term}`;
      }
      
      query = sql`
        ${query}
        GROUP BY s.id, s.student_id, s.surname, s.other_names, c.class_name
        HAVING COUNT(sr.id) >= 5  -- Only include students with at least 5 subjects
        ORDER BY AVG(sr.total_score) DESC
        LIMIT ${limit}
      `;
      
      return await query;
    } catch (error) {
      console.error('Error fetching top students:', error);
      return [];
    }
  },

  async getTopStudentsByClass(academicYear?: string, term?: number) {
    try {
      let query = sql`
        WITH class_averages AS (
          SELECT 
            s.id,
            s.student_id,
            s.surname,
            s.other_names,
            c.class_name,
            c.id as class_id,
            AVG(sr.total_score) as average_score,
            COUNT(sr.id) as subjects_count
          FROM students s
          JOIN student_results sr ON s.id = sr.student_id
          JOIN classes c ON s.current_class_id = c.id
          WHERE s.is_active = true AND sr.is_active = true
      `;
      
      if (academicYear) {
        query = sql`${query} AND sr.academic_year = ${academicYear}`;
      }
      
      if (term) {
        query = sql`${query} AND sr.term = ${term}`;
      }
      
      query = sql`
        ${query}
          GROUP BY s.id, s.student_id, s.surname, s.other_names, c.class_name, c.id
          HAVING COUNT(sr.id) >= 5  -- Only include students with at least 5 subjects
        ),
        ranked_students AS (
          SELECT 
            *,
            ROW_NUMBER() OVER (PARTITION BY class_id ORDER BY average_score DESC) as class_rank
          FROM class_averages
        )
        SELECT * FROM ranked_students WHERE class_rank = 1
        ORDER BY average_score DESC
      `;
      
      return await query;
    } catch (error) {
      console.error('Error fetching top students by class:', error);
      return [];
    }
  },

  async getTopStudentsByCourse(courseId: number, limit: number = 10, academicYear?: string, term?: number) {
    try {
      let query = sql`
        SELECT 
          s.id,
          s.student_id,
          s.surname,
          s.other_names,
          c.class_name,
          crs.name as course_name,
          AVG(sr.total_score) as average_score,
          COUNT(sr.id) as subjects_count
        FROM students s
        JOIN student_results sr ON s.id = sr.student_id
        JOIN classes c ON s.current_class_id = c.id
        JOIN courses crs ON c.course_id = crs.id
        WHERE s.is_active = true AND sr.is_active = true AND c.course_id = ${courseId}
      `;
      
      if (academicYear) {
        query = sql`${query} AND sr.academic_year = ${academicYear}`;
      }
      
      if (term) {
        query = sql`${query} AND sr.term = ${term}`;
      }
      
      query = sql`
        ${query}
        GROUP BY s.id, s.student_id, s.surname, s.other_names, c.class_name, crs.name
        HAVING COUNT(sr.id) >= 5  -- Only include students with at least 5 subjects
        ORDER BY AVG(sr.total_score) DESC
        LIMIT ${limit}
      `;
      
      return await query;
    } catch (error) {
      console.error('Error fetching top students by course:', error);
      return [];
    }
  },

  async getStudentPerformanceSummary(academicYear?: string, term?: number) {
    try {
      let query = sql`
        SELECT 
          s.id,
          s.student_id,
          s.surname,
          s.other_names,
          c.class_name,
          AVG(sr.total_score) as average_score,
          COUNT(sr.id) as subjects_count,
          SUM(CASE WHEN sr.total_score >= 50 THEN 1 ELSE 0 END) as passed_subjects,
          SUM(CASE WHEN sr.total_score < 50 THEN 1 ELSE 0 END) as failed_subjects
        FROM students s
        JOIN student_results sr ON s.id = sr.student_id
        JOIN classes c ON s.current_class_id = c.id
        WHERE s.is_active = true AND sr.is_active = true
      `;
      
      if (academicYear) {
        query = sql`${query} AND sr.academic_year = ${academicYear}`;
      }
      
      if (term) {
        query = sql`${query} AND sr.term = ${term}`;
      }
      
      query = sql`
        ${query}
        GROUP BY s.id, s.student_id, s.surname, s.other_names, c.class_name
        HAVING COUNT(sr.id) >= 5  -- Only include students with at least 5 subjects
        ORDER BY AVG(sr.total_score) DESC
      `;
      
      return await query;
    } catch (error) {
      console.error('Error fetching student performance summary:', error);
      return [];
    }
  },

  // --- VOTING SYSTEM MODULE ---

  async createElection(data: { name: string; description?: string; start_time: string; end_time: string }) {
    const result = await sql`
      INSERT INTO elections (name, description, start_time, end_time, status)
      VALUES (${data.name}, ${data.description || null}, ${data.start_time}, ${data.end_time}, 'draft')
      RETURNING *
    `;
    return result[0];
  },

  async getElections() {
    try {
      return await sql`SELECT * FROM elections ORDER BY created_at DESC`;
    } catch (error) {
      console.error('Error fetching elections:', error);
      return [];
    }
  },

  async getElectionById(id: number) {
    try {
      const election = await sql`SELECT * FROM elections WHERE id = ${id}`;
      if (election.length === 0) return null;

      const positions = await this.getPositions(id);
      return { ...election[0], positions };
    } catch (error) {
      console.error('Error fetching election by ID:', error);
      return null;
    }
  },

  async updateElectionStatus(id: number, status: string) {
    return await sql`UPDATE elections SET status = ${status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id} RETURNING *`;
  },

  async updateElectionSchedule(id: number, startTime: string, endTime: string) {
    return await sql`
      UPDATE elections 
      SET start_time = ${startTime}, end_time = ${endTime}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} 
      RETURNING *
    `;
  },

  async deleteElection(id: number) {
    return await sql`DELETE FROM elections WHERE id = ${id}`;
  },

  async createPosition(data: { election_id: number; title: string; max_selections?: number }) {
    const result = await sql`
      INSERT INTO positions (election_id, title, max_selections)
      VALUES (${data.election_id}, ${data.title}, ${data.max_selections || 1})
      RETURNING *
    `;
    return result[0];
  },

  async getPositions(electionId: number) {
    try {
      return await sql`SELECT * FROM positions WHERE election_id = ${electionId} ORDER BY sort_order ASC, id ASC`;
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  },

  async createCandidate(data: { position_id: number; student_id?: number; display_name: string; manifesto?: string; image_url?: string }) {
    const result = await sql`
      INSERT INTO candidates (position_id, student_id, display_name, manifesto, image_url)
      VALUES (${data.position_id}, ${data.student_id || null}, ${data.display_name}, ${data.manifesto || null}, ${data.image_url || null})
      RETURNING *
    `;
    return result[0];
  },

  async getCandidates(positionId: number) {
    try {
      return await sql`
        SELECT 
          c.*, 
          s.surname, 
          s.other_names, 
          cl.class_name as student_class
        FROM candidates c 
        LEFT JOIN students s ON c.student_id = s.id
        LEFT JOIN classes cl ON s.current_class_id = cl.id
        WHERE c.position_id = ${positionId} 
        ORDER BY c.display_name ASC
      `;
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }
  },

  async submitVote(electionId: number, studentId: number, selections: { position_id: number; candidate_id: number }[]) {
    try {
      // Use a transaction wrap if possible, but with neon serverless we do sequential calls or a complex query
      // 1. Check if already voted
      const check = await sql`SELECT 1 FROM voter_status WHERE election_id = ${electionId} AND student_id = ${studentId}`;
      if (check.length > 0) throw new Error('ALREADY_VOTED');

      // 2. Record voter status
      await sql`INSERT INTO voter_status (election_id, student_id) VALUES (${electionId}, ${studentId})`;

      // 3. Insert votes
      for (const selection of selections) {
        await sql`
          INSERT INTO votes (election_id, position_id, candidate_id)
          VALUES (${electionId}, ${selection.position_id}, ${selection.candidate_id})
        `;
      }

      return { success: true };
    } catch (error) {
      console.error('Vote submission error:', error);
      throw error;
    }
  },

  async getParticipationStats(electionId: number) {
    const totalStudents = await sql`SELECT COUNT(*) FROM students WHERE is_active = true`;
    const votedStudents = await sql`SELECT COUNT(*) FROM voter_status WHERE election_id = ${electionId}`;
    
    const total = parseInt(totalStudents[0].count);
    const voted = parseInt(votedStudents[0].count);
    
    return {
      total,
      voted,
      remaining: total - voted,
      percentage: total > 0 ? Math.round((voted / total) * 100) : 0
    };
  },

  async getElectionResults(electionId: number) {
    return await sql`
      SELECT 
        p.title as position_title,
        c.display_name as candidate_name,
        cl.class_name as candidate_class,
        COUNT(v.id) as vote_count
      FROM positions p
      JOIN candidates c ON p.id = c.position_id
      LEFT JOIN students s ON c.student_id = s.id
      LEFT JOIN classes cl ON s.current_class_id = cl.id
      LEFT JOIN votes v ON c.id = v.candidate_id
      WHERE p.election_id = ${electionId}
      GROUP BY p.id, p.title, c.id, c.display_name, cl.class_name
      ORDER BY p.sort_order, p.id, vote_count DESC
    `;
  },


  async createAuditLog(action: string, performedBy: string, details: any) {
    await sql`
      INSERT INTO audit_logs (action, performed_by, details)
      VALUES (${action}, ${performedBy}, ${JSON.stringify(details)})
    `;
  },

  // --- BULK STUDENT IMPORT ---

  async bulkImportStudents(studentsList: {
    surname: string;
    other_names: string;
    class_id: number;
    course_id: number;
    admission_number?: string;
    date_of_birth?: string;
    gender?: string;
  }[]) {
    const year = new Date().getFullYear();
    const results = [];
    
    const lastStu = await sql`SELECT user_id FROM users WHERE user_id LIKE ${`STU${year}%`} ORDER BY user_id DESC LIMIT 1`;
    let nextNum = 1;
    if (lastStu.length > 0) {
      const match = lastStu[0].user_id.match(/\d{3}$/);
      if (match) nextNum = parseInt(match[0]) + 1;
    }

    const lastAsa = await sql`SELECT admission_number FROM students WHERE admission_number LIKE ${`ASA${year}%`} ORDER BY admission_number DESC LIMIT 1`;
    let nextAsaNum = 1;
    if (lastAsa.length > 0) {
      const match = lastAsa[0].admission_number.match(/\d{3}$/);
      if (match) nextAsaNum = parseInt(match[0]) + 1;
    }

    for (const student of studentsList) {
      const studentId = `STU${year}${nextNum.toString().padStart(3, '0')}`;
      const admissionNum = student.admission_number || `ASA${year}${nextAsaNum.toString().padStart(3, '0')}`;
      const tempPassword = generateRandomPassword(8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const userRes = await sql`
        INSERT INTO users (user_id, user_type, password_hash, temp_password, must_change_password)
        VALUES (${studentId}, 'student', ${hashedPassword}, ${tempPassword}, true)
        RETURNING id
      `;
      const userId = userRes[0].id;

      await sql`
        INSERT INTO students (
          user_id, student_id, admission_number, surname, other_names, 
          current_class_id, course_id, date_of_birth, gender,
          registration_status, is_active
        ) VALUES (
          ${userId}, ${studentId}, ${admissionNum}, ${student.surname}, ${student.other_names},
          ${student.class_id}, ${student.course_id},
          ${student.date_of_birth || null}, ${student.gender || null},
          'complete', true
        )
      `;

      results.push({
        name: `${student.surname} ${student.other_names}`,
        studentId,
        admissionNum,
        tempPassword
      });

      nextNum++;
      if (!student.admission_number) nextAsaNum++;
    }

    return results;
  },

  async bulkImportTeachers(teachersList: { surname: string; other_names: string; staff_id?: string; department: string; gender: string; title: string; position_rank: string }[]) {
    const year = new Date().getFullYear();
    const results = [];

    const lastTea = await sql`SELECT user_id FROM users WHERE user_id LIKE ${`TEA${year}%`} ORDER BY user_id DESC LIMIT 1`;
    let nextNum = 1;
    if (lastTea.length > 0) {
      const match = lastTea[0].user_id.match(/\d{3}$/);
      if (match) nextNum = parseInt(match[0]) + 1;
    }

    for (const teacher of teachersList) {
      const teacherId = `TEA${year}${nextNum.toString().padStart(3, '0')}`;
      const tempPassword = generateRandomPassword(8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const userRes = await sql`
        INSERT INTO users (user_id, user_type, password_hash, temp_password, must_change_password)
        VALUES (${teacherId}, 'teacher', ${hashedPassword}, ${tempPassword}, true)
        RETURNING id
      `;
      const userId = userRes[0].id;

      const staffId = teacher.staff_id || teacherId;

      await sql`
        INSERT INTO teachers (
          user_id, teacher_id, staff_id, title, surname, other_names, gender,
          department, position_rank, is_active
        ) VALUES (
          ${userId}, ${teacherId}, ${staffId}, ${teacher.title}, ${teacher.surname},
          ${teacher.other_names}, ${teacher.gender}, ${teacher.department},
          ${teacher.position_rank}, true
        )
      `;

      results.push({
        name: `${teacher.title} ${teacher.surname} ${teacher.other_names}`,
        teacherId,
        staffId,
        tempPassword
      });

      nextNum++;
    }

    return results;
  },

  async getStudentsByRegistrationStatus(status: string) {
    return await sql`
      SELECT s.*, c.class_name, co.name as course_name 
      FROM students s
      JOIN classes c ON s.current_class_id = c.id
      JOIN courses co ON s.course_id = co.id
      WHERE s.registration_status = ${status} AND s.is_active = true
      ORDER BY s.surname ASC
    `;
  },

  async updateStudentRegistration(id: number, data: any) {
    return await sql`
      UPDATE students 
      SET 
        date_of_birth = ${data.date_of_birth || null},
        gender = ${data.gender || null},
        address = ${data.address || null},
        guardian_name = ${data.guardian_name || null},
        guardian_phone = ${data.guardian_phone || null},
        registration_status = 'complete',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
  },

  getLearningMaterials,
  uploadLearningMaterial,
  deleteLearningMaterial,

  // Settings
  async getSchoolSetting(key: string): Promise<string> {
    const result = await sql`SELECT setting_value FROM school_settings WHERE setting_key = ${key}`;
    return result.length > 0 ? result[0].setting_value : '';
  },

  async updateSchoolSetting(key: string, value: string) {
    await sql`
      INSERT INTO school_settings (setting_key, setting_value, updated_at)
      VALUES (${key}, ${value}, CURRENT_TIMESTAMP)
      ON CONFLICT (setting_key) DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        updated_at = CURRENT_TIMESTAMP
    `;
  },

  async getAIKeys(): Promise<string[]> {
    const raw = await this.getSchoolSetting('github_model_api_keys');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      // Fallback for migration: if it was a single string, return as array
      return [raw];
    }
  },

  async updateAIKeys(keys: string[]) {
    await this.updateSchoolSetting('github_model_api_keys', JSON.stringify(keys));
  },

  // eLearning Quizzes
  async getQuizzes(filters?: { class_id?: number; teacher_id?: number; subject_id?: number }) {
    let query = sql`
      SELECT q.*, t.surname as teacher_surname, t.other_names as teacher_other_names,
             s.name as subject_name, c.class_name
      FROM elearning_quizzes q
      LEFT JOIN teachers t ON q.teacher_id = t.id
      JOIN subjects s ON q.subject_id = s.id
      JOIN classes c ON q.class_id = c.id
      WHERE q.is_active = true
    `;
    
    if (filters?.class_id) query = sql`${query} AND q.class_id = ${filters.class_id}`;
    if (filters?.teacher_id) query = sql`${query} AND q.teacher_id = ${filters.teacher_id}`;
    if (filters?.subject_id) query = sql`${query} AND q.subject_id = ${filters.subject_id}`;
    
    return await query;
  },

  async getQuizById(quizId: number) {
    const quiz = await sql`SELECT * FROM elearning_quizzes WHERE id = ${quizId}`;
    if (quiz.length === 0) return null;
    
    const questions = await sql`
      SELECT q.*, 
             (SELECT json_agg(o.*) FROM quiz_options o WHERE o.question_id = q.id) as options,
             (SELECT json_agg(a.*) FROM quiz_correct_answers a WHERE a.question_id = q.id) as correct_answers
      FROM quiz_questions q
      WHERE q.quiz_id = ${quizId}
      ORDER BY q.order_index ASC
    `;
    
    return { ...quiz[0], questions };
  },

  async createQuiz(data: any) {
    const effectiveDuration = data.duration_minutes || data.time_limit || 60;
    const insertQuiz = () => sql`
      INSERT INTO elearning_quizzes (
        teacher_id, class_id, subject_id, title, description, instructions, time_limit,
        passing_score, total_points, shuffle_questions, shuffle_options, show_results_immediately,
        allow_answer_review, display_mode, allow_late_grading, due_date, duration_minutes,
        max_attempts
      )
      VALUES (
        ${data.teacher_id}, ${data.class_id}, ${data.subject_id}, ${data.title}, ${data.description},
        ${data.instructions}, ${effectiveDuration}, ${data.passing_score}, ${data.total_points},
        ${data.shuffle_questions || false}, ${data.shuffle_options || false},
        ${data.show_results_immediately !== undefined ? data.show_results_immediately : true},
        ${data.allow_answer_review || false},
        ${data.display_mode || 'all_at_once'}, ${data.allow_late_grading || false},
        ${data.due_date || null}, ${effectiveDuration},
        ${data.max_attempts ?? 1}
      )
      RETURNING id
    `;
    let result;
    try {
      result = await insertQuiz();
    } catch (e: any) {
      const msg = String(e?.message || '');
      const colMatch = msg.match(/column "([^"]+)" of relation "([^"]+)" does not exist/);
      if (colMatch) {
        const [, colName, relName] = colMatch;
        const typeMap: Record<string, string> = {
          allow_answer_review: 'BOOLEAN DEFAULT false',
          max_attempts: 'INTEGER DEFAULT 1',
        };
        const colType = typeMap[colName] || 'TEXT';
        try {
          await sql`ALTER TABLE ${sql.unsafe(relName)} ADD COLUMN IF NOT EXISTS ${sql.unsafe(colName)} ${sql.unsafe(colType)}`;
        } catch {}
        result = await insertQuiz();
      } else {
        throw e;
      }
    }
    const quizId = result[0].id;
    
    for (const q of data.questions) {
      const qResult = await sql`
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, points, order_index, group_id)
        VALUES (${quizId}, ${q.question_text}, ${q.question_type}, ${q.points}, ${q.order_index}, ${q.group_id || 0})
        RETURNING id
      `;
      const qId = qResult[0].id;
      
      if (q.options) {
        for (const opt of q.options) {
          await sql`INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (${qId}, ${opt.option_text}, ${opt.is_correct})`;
        }
      }
      
      if (q.correct_answers) {
        for (const ans of q.correct_answers) {
          await sql`INSERT INTO quiz_correct_answers (question_id, answer_text) VALUES (${qId}, ${ans})`;
        }
      }
    }
    return quizId;
  },

  async deleteQuiz(quizId: number) {
    checkDatabaseConfig();
    await sql`UPDATE assignments SET quiz_id = NULL WHERE quiz_id = ${quizId}`;
    await sql`DELETE FROM quiz_correct_answers WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = ${quizId})`;
    await sql`DELETE FROM quiz_options WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = ${quizId})`;
    await sql`DELETE FROM quiz_attempts WHERE quiz_id = ${quizId}`;
    await sql`DELETE FROM quiz_questions WHERE quiz_id = ${quizId}`;
    await sql`DELETE FROM elearning_quizzes WHERE id = ${quizId}`;
    return { success: true };
  },

  async getQuizAttempts(filters: { student_id?: number; quiz_id?: number }) {
    let query = sql`
      SELECT a.*, q.title as quiz_title, s.name as subject_name,
             q.show_results_immediately
      FROM quiz_attempts a
      JOIN elearning_quizzes q ON a.quiz_id = q.id
      JOIN subjects s ON q.subject_id = s.id
      WHERE 1=1
    `;
    if (filters.student_id) query = sql`${query} AND a.student_id = ${filters.student_id}`;
    if (filters.quiz_id) query = sql`${query} AND a.quiz_id = ${filters.quiz_id}`;
    return await query;
  },

  async getExistingQuizAttempt(studentId: number, quizId: number) {
    const result = await sql`
      SELECT id, status, score, percentage, start_time, end_time
      FROM quiz_attempts
      WHERE student_id = ${studentId} AND quiz_id = ${quizId}
      ORDER BY start_time DESC
      LIMIT 1
    `;
    return result[0] || null;
  },

  async getMaxAttempts(quizId: number) {
    try {
      const result = await sql`SELECT max_attempts FROM elearning_quizzes WHERE id = ${quizId}`;
      return result[0]?.max_attempts ?? 1;
    } catch {
      return 1;
    }
  },

  async getCompletedAttemptCount(studentId: number, quizId: number) {
    try {
      const result = await sql`
        SELECT COUNT(*) as cnt FROM quiz_attempts
        WHERE student_id = ${studentId} AND quiz_id = ${quizId} AND status = 'completed'
      `;
      return Number(result[0]?.cnt || 0);
    } catch {
      return 0;
    }
  },

  async startQuizAttempt(studentId: number, quizId: number) {
    const maxAttempts = await this.getMaxAttempts(quizId);
    const completedCount = await this.getCompletedAttemptCount(studentId, quizId);
    if (completedCount >= maxAttempts) {
      throw new Error(`You have used all ${maxAttempts} attempt(s) for this assessment. No more attempts allowed.`);
    }
    const existing = await this.getExistingQuizAttempt(studentId, quizId);
    if (existing && existing.status === 'in-progress') {
      return existing.id;
    }
    const result = await sql`
      INSERT INTO quiz_attempts (student_id, quiz_id, status)
      VALUES (${studentId}, ${quizId}, 'in-progress')
      RETURNING id
    `;
    return result[0].id;
  },

  async submitQuizResponse(data: { attempt_id: number; question_id: number; response_text: string; is_correct: boolean; points_earned: number }) {
    await sql`
      INSERT INTO quiz_responses (attempt_id, question_id, response_text, is_correct, points_earned)
      VALUES (${data.attempt_id}, ${data.question_id}, ${data.response_text}, ${data.is_correct}, ${data.points_earned})
    `;
  },

  async completeQuizAttempt(attemptId: number, score: number, percentage: number, tabSwitches: number = 0) {
    const runUpdate = () => sql`
      UPDATE quiz_attempts 
      SET score = ${score}, percentage = ${percentage}, tab_switches = ${tabSwitches}, status = 'completed', end_time = CURRENT_TIMESTAMP
      WHERE id = ${attemptId}
    `;
    try {
      await runUpdate();
    } catch (e: any) {
      const msg = String(e?.message || '');
      const colMatch = msg.match(/column "([^"]+)" of relation "([^"]+)" does not exist/);
      if (colMatch) {
        const [, colName, relName] = colMatch;
        const typeMap: Record<string, string> = {
          percentage: 'DECIMAL(5,2) DEFAULT 0',
          end_time: 'TIMESTAMP',
          tab_switches: 'INTEGER DEFAULT 0',
        };
        const colType = typeMap[colName] || 'TEXT';
        try {
          await sql`ALTER TABLE ${sql.unsafe(relName)} ADD COLUMN IF NOT EXISTS ${sql.unsafe(colName)} ${sql.unsafe(colType)}`;
        } catch {}
        await runUpdate();
      } else {
        throw e;
      }
    }
  },

  async getDetailedQuizAttempts(quizId: number, classId?: number) {
    const typeMap: Record<string, string> = {
      end_time: 'TIMESTAMP',
      percentage: 'DECIMAL(5,2) DEFAULT 0',
      tab_switches: 'INTEGER DEFAULT 0',
      points: 'DECIMAL(10,2) DEFAULT 0',
      submission_type: "VARCHAR(50) DEFAULT 'auto'",
      start_time: 'TIMESTAMP',
    };
    const attemptSql = () => {
      if (classId) {
        return sql`
          SELECT s.id as student_id, s.surname, s.other_names,
                 u.user_id as student_admission_number,
                 a.id as attempt_id, a.score, a.percentage, a.tab_switches, a.status, a.end_time, a.start_time
          FROM students s
          JOIN users u ON s.user_id = u.id
          LEFT JOIN quiz_attempts a ON a.student_id = s.id AND a.quiz_id = ${quizId} AND a.status = 'completed'
          WHERE s.current_class_id = ${classId} AND s.is_active = true
          ORDER BY s.surname, s.other_names
        `;
      }
      return sql`
        SELECT a.*, u.user_id as student_admission_number, s.surname, s.other_names
        FROM quiz_attempts a
        JOIN students s ON a.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE a.quiz_id = ${quizId} AND a.status = 'completed'
        ORDER BY a.id DESC
      `;
    };
    try {
      return await attemptSql();
    } catch (e: any) {
      const msg = String(e?.message || '');
      const colMatch = msg.match(/column "([^"]+)" of relation "([^"]+)" does not exist/);
      if (colMatch) {
        const [, colName, relName] = colMatch;
        const colType = typeMap[colName] || 'TEXT';
        try {
          await sql`ALTER TABLE ${sql.unsafe(relName)} ADD COLUMN IF NOT EXISTS ${sql.unsafe(colName)} ${sql.unsafe(colType)}`;
        } catch {}
        return await attemptSql();
      }
      throw e;
    }
  },

  // --- Sub-Admins Management ---
  async getSubAdmins() {
    checkDatabaseConfig();
    return await sql`
      SELECT id, user_id, full_name, is_active, created_at 
      FROM users 
      WHERE user_type = 'admin' AND user_id != 'ADMIN001'
      ORDER BY created_at DESC
    `;
  },
  
  async createSubAdmin(fullName: string) {
    checkDatabaseConfig();
    const tempPassword = 'admin' + Math.floor(100 + Math.random() * 900);
    const hash = await bcrypt.hash(tempPassword, 10);
    
    // Generate ADMIN ID (e.g. ADMIN002)
    const countResult = await sql`SELECT COUNT(*) as count FROM users WHERE user_type = 'admin'`;
    const count = parseInt(countResult[0].count) + 1;
    const userId = 'ADMIN' + count.toString().padStart(3, '0');

    const result = await sql`
      INSERT INTO users (user_id, password_hash, temp_password, user_type, full_name, role)
      VALUES (${userId}, ${hash}, ${tempPassword}, 'admin', ${fullName}, 'admin')
      RETURNING id, user_id, full_name, temp_password
    `;
    return result[0];
  },

  async deleteSubAdmin(id: number) {
    checkDatabaseConfig();
    // Prevent deleting ADMIN001
    await sql`
      DELETE FROM users 
      WHERE id = ${id} AND user_id != 'ADMIN001' AND user_type = 'admin'
    `;
    return true;
  },

  async resetSubAdminPassword(id: number) {
    checkDatabaseConfig();
    const tempPassword = 'admin' + Math.floor(100 + Math.random() * 900);
    const hash = await bcrypt.hash(tempPassword, 10);
    
    const result = await sql`
      UPDATE users 
      SET password_hash = ${hash}, temp_password = ${tempPassword}, must_change_password = true
      WHERE id = ${id} AND user_id != 'ADMIN001' AND user_type = 'admin'
      RETURNING user_id, temp_password
    `;
    return result[0];
  },

  async toggleSubAdminStatus(id: number) {
    checkDatabaseConfig();
    await sql`
      UPDATE users 
      SET is_active = NOT is_active
      WHERE id = ${id} AND user_id != 'ADMIN001' AND user_type = 'admin'
    `;
    return true;
  },

    // --- System Maintenance ---

  async ensureSystemConfigTable() {
    try {
      await sql`CREATE TABLE IF NOT EXISTS system_config (key VARCHAR PRIMARY KEY, value TEXT NOT NULL)`;
      await sql`INSERT INTO system_config (key, value) VALUES ('maintenance_mode', 'false') ON CONFLICT (key) DO NOTHING`;
      const now = new Date();
      const y = now.getFullYear();
      const defaultAY = now.getMonth() >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
      await sql`INSERT INTO system_config (key, value) VALUES ('current_academic_year', ${defaultAY}) ON CONFLICT (key) DO NOTHING`;
      await sql`INSERT INTO system_config (key, value) VALUES ('current_semester', '1') ON CONFLICT (key) DO NOTHING`;
    } catch (e) {
      console.error('Failed to ensure system_config table:', e);
    }
  },

  async getMaintenanceMode(): Promise<boolean> {
    try {
      const result = await sql`SELECT value FROM system_config WHERE key = 'maintenance_mode'`;
      return result[0]?.value === 'true';
    } catch {
      return false;
    }
  },

  async setMaintenanceMode(enabled: boolean) {
    await this.ensureSystemConfigTable();
    await sql`INSERT INTO system_config (key, value) VALUES ('maintenance_mode', ${enabled ? 'true' : 'false'}) ON CONFLICT (key) DO UPDATE SET value = ${enabled ? 'true' : 'false'}`;
    return enabled;
  },

  async getCurrentAcademicYear(): Promise<string> {
    try {
      const result = await sql`SELECT value FROM system_config WHERE key = 'current_academic_year'`;
      return result[0]?.value || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
    } catch { return `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`; }
  },

  async setCurrentAcademicYear(year: string) {
    await this.ensureSystemConfigTable();
    await sql`INSERT INTO system_config (key, value) VALUES ('current_academic_year', ${year}) ON CONFLICT (key) DO UPDATE SET value = ${year}`;
    return year;
  },

  async getCurrentSemester(): Promise<number> {
    try {
      const result = await sql`SELECT value FROM system_config WHERE key = 'current_semester'`;
      return parseInt(result[0]?.value || '1');
    } catch { return 1; }
  },

  async setCurrentSemester(semester: number) {
    await this.ensureSystemConfigTable();
    await sql`INSERT INTO system_config (key, value) VALUES ('current_semester', ${semester.toString()}) ON CONFLICT (key) DO UPDATE SET value = ${semester.toString()}`;
    return semester;
  },

  // --- General Exams Management ---
  async createGeneralExam(examData: {
    title: string;
    description?: string;
    instructions?: string;
    exam_type: string;
    subject_id: number;
    due_date: string;
    duration_minutes?: number;
    max_score: number;
    has_obj: boolean;
    has_theory: boolean;
    theory_content_url?: string;
    obj_answer_key?: string;
    extractedQuestions?: any[];
    shuffle_questions?: boolean;
    shuffle_options?: boolean;
    show_results_immediately?: boolean;
    allow_answer_review?: boolean;
    allow_late_grading?: boolean;
    display_mode?: string;
    max_attempts?: number;
  }, classIds: number[]) {
    checkDatabaseConfig();
    
    let quizId = null;

    // If there are extracted questions, create a master elearning_quiz record
    if (examData.has_obj && examData.extractedQuestions && examData.extractedQuestions.length > 0) {
      // Calculate total points
      const totalPoints = examData.extractedQuestions.reduce((sum: number, q: any) => sum + (q.points || 1), 0);

      // Create master quiz (no specific class/teacher since it's general)
      const insertExamQuiz = () => sql`
        INSERT INTO elearning_quizzes (
          title, description, instructions, subject_id, shuffle_questions, shuffle_options,
          show_results_immediately, allow_answer_review, allow_late_grading, display_mode, time_limit,
          due_date, duration_minutes, total_points, max_attempts
        ) VALUES (
          ${examData.title}, ${examData.description || null}, ${examData.instructions || null},
          ${examData.subject_id},
          ${examData.shuffle_questions || false}, ${examData.shuffle_options || false},
          ${examData.show_results_immediately !== false}, ${examData.allow_answer_review || false},
          ${examData.allow_late_grading || false},
          ${examData.display_mode || 'all_at_once'}, ${examData.duration_minutes || 60},
          ${examData.due_date}, ${examData.duration_minutes || 60},
          ${totalPoints},
          ${examData.max_attempts ?? 1}
        )
        RETURNING id
      `;
      let qResult;
      try {
        qResult = await insertExamQuiz();
      } catch (e: any) {
        const msg = String(e?.message || '');
        const colMatch = msg.match(/column "([^"]+)" of relation "([^"]+)" does not exist/);
        if (colMatch) {
          const [, colName, relName] = colMatch;
          const typeMap: Record<string, string> = {
            allow_answer_review: 'BOOLEAN DEFAULT false',
            max_attempts: 'INTEGER DEFAULT 1',
          };
          const colType = typeMap[colName] || 'TEXT';
          try {
            await sql`ALTER TABLE ${sql.unsafe(relName)} ADD COLUMN IF NOT EXISTS ${sql.unsafe(colName)} ${sql.unsafe(colType)}`;
          } catch {}
          qResult = await insertExamQuiz();
        } else {
          throw e;
        }
      }
      quizId = qResult[0].id;

      // Insert questions
      for (let i = 0; i < examData.extractedQuestions.length; i++) {
        const q = examData.extractedQuestions[i];
        const questionResult = await sql`
          INSERT INTO quiz_questions (quiz_id, question_text, question_type, points, order_index, group_id)
          VALUES (${quizId}, ${q.question_text}, ${q.question_type}, ${q.points || 1}, ${i}, ${q.group_id || 0})
          RETURNING id
        `;
        const questionId = questionResult[0].id;

        if (q.options && q.options.length > 0) {
          for (const opt of q.options) {
            await sql`INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (${questionId}, ${opt.option_text}, ${opt.is_correct || false})`;
          }
        }

        if (q.correct_answers && q.correct_answers.length > 0) {
          for (const ans of q.correct_answers) {
            await sql`INSERT INTO quiz_correct_answers (question_id, answer_text) VALUES (${questionId}, ${ans})`;
          }
        }
      }
    }

    const results = [];
    // We create a separate assignment record for each class selected.
    for (const classId of classIds) {
      // Find assignment_type_id for 'Exam' or fallback to 1
      const typeResult = await sql`SELECT id FROM assignment_types WHERE name ILIKE '%Exam%' LIMIT 1`;
      const assignmentTypeId = typeResult.length > 0 ? typeResult[0].id : 1;

      const result = await sql`
        INSERT INTO assignments (
          title, description, exam_type, is_general_exam, subject_id, class_id, 
          due_date, duration_minutes, max_score, assignment_type_id, is_active,
          has_obj, has_theory, theory_content_url, obj_answer_key, quiz_id,
          shuffle_questions, shuffle_options, show_results_immediately, allow_late_grading, display_mode
        ) VALUES (
          ${examData.title}, ${examData.description || null}, ${examData.exam_type}, true,
          ${examData.subject_id}, ${classId}, ${examData.due_date}, ${examData.duration_minutes || 60}, ${examData.max_score}, 
          ${assignmentTypeId}, true,
          ${examData.has_obj}, ${examData.has_theory}, ${examData.theory_content_url || null}, 
          ${examData.obj_answer_key || null}, ${quizId},
          ${examData.shuffle_questions || false}, ${examData.shuffle_options || false},
          ${examData.show_results_immediately !== false}, ${examData.allow_late_grading || false},
          ${examData.display_mode || 'all_at_once'}
        )
        RETURNING *
      `;
      results.push(result[0]);
    }
    return results;
  },

    async deleteGeneralExam(title: string, dueDate: string) {
      checkDatabaseConfig();
      try {
        const assignments = await sql`
          SELECT id, quiz_id FROM assignments 
          WHERE title = ${title} AND due_date = ${dueDate} AND is_general_exam = true
        `;
        
        for (const a of assignments) {
          if (a.quiz_id) {
            await sql`DELETE FROM elearning_quizzes WHERE id = ${a.quiz_id}`;
          }
        }
        
        await sql`DELETE FROM assignments WHERE title = ${title} AND due_date = ${dueDate} AND is_general_exam = true`;
        return { success: true };
      } catch (error) {
        console.error('Error deleting general exam:', error);
        throw new Error('Failed to delete general exam');
      }
    },

    async getGeneralExams() {
    checkDatabaseConfig();
    try {
      return await sql`
        SELECT a.*, 
               s.name as subject_name,
               c.class_name,
               c.form,
               c.course_id,
               eq.max_attempts
        FROM assignments a
        JOIN subjects s ON a.subject_id = s.id
        JOIN classes c ON a.class_id = c.id
        LEFT JOIN elearning_quizzes eq ON a.quiz_id = eq.id
        WHERE a.is_general_exam = true
        ORDER BY a.created_at DESC
      `;
    } catch {
      try {
        await sql`ALTER TABLE elearning_quizzes ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 1`;
      } catch {}
      return await sql`
        SELECT a.*, 
               s.name as subject_name,
               c.class_name,
               c.form,
               c.course_id,
               eq.max_attempts
        FROM assignments a
        JOIN subjects s ON a.subject_id = s.id
        JOIN classes c ON a.class_id = c.id
        LEFT JOIN elearning_quizzes eq ON a.quiz_id = eq.id
        WHERE a.is_general_exam = true
        ORDER BY a.created_at DESC
      `;
    }
  },

  async getStudentExams(classId: number) {
    checkDatabaseConfig();
    return await sql`
      SELECT a.*, 
             s.name as subject_name
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.is_general_exam = true
        AND a.class_id = ${classId}
        AND a.is_active = true
      ORDER BY a.due_date ASC
    `;
  },

  async getExamReports(title: string, dueDate: string) {
    checkDatabaseConfig();
    return await sql`
      SELECT 
        COALESCE(sub.id, qa.id) as submission_id,
        COALESCE(sub.score, qa.score) as score,
        sub.obj_score, sub.theory_score,
        COALESCE(sub.status, qa.status) as status,
        st.student_id as admission_number, st.surname, st.other_names,
        c.class_name
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      JOIN students st ON st.current_class_id = c.id
      LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.student_id = st.id
      LEFT JOIN quiz_attempts qa ON qa.quiz_id = a.quiz_id AND qa.student_id = st.id
      WHERE a.title = ${title} 
        AND a.due_date = ${dueDate}
        AND a.is_general_exam = true
      ORDER BY c.class_name, st.surname, st.other_names
    `;
  },

  async submitExam(data: {
    assignment_id: number;
    student_id: number;
    obj_score: number;
  }) {
    checkDatabaseConfig();
    
    // Check if submission already exists
    const existing = await sql`
      SELECT id FROM assignment_submissions 
      WHERE assignment_id = ${data.assignment_id} AND student_id = ${data.student_id}
    `;

    if (existing.length > 0) {
      return await sql`
        UPDATE assignment_submissions
        SET obj_score = ${data.obj_score},
            score = COALESCE(theory_score, 0) + ${data.obj_score},
            status = 'graded',
            updated_at = NOW()
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
    }

    return await sql`
      INSERT INTO assignment_submissions (
        assignment_id, student_id, obj_score, score, status, submission_date
      ) VALUES (
        ${data.assignment_id}, ${data.student_id}, ${data.obj_score}, ${data.obj_score}, 'graded', NOW()
      )
      RETURNING *
    `;
  },

  async getTeacherGeneralExams(teacherId: number) {
    checkDatabaseConfig();
    return await sql`
      SELECT a.*, 
             s.name as subject_name,
             c.class_name
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      JOIN classes c ON a.class_id = c.id
      JOIN teacher_subjects ts ON ts.class_id = c.id AND ts.subject_id = a.subject_id
      WHERE a.is_general_exam = true
        AND ts.teacher_id = ${teacherId}
      ORDER BY a.due_date DESC
    `;
  },

  async getExamSubmissionsByAssignment(assignmentId: number) {
    checkDatabaseConfig();
    return await sql`
      SELECT 
        COALESCE(sub.id, qa.id) as submission_id,
        COALESCE(sub.score, qa.score) as score,
        sub.obj_score, sub.theory_score,
        COALESCE(sub.status, qa.status) as status,
        st.id as student_id, st.surname, st.other_names, st.student_id as admission_number
      FROM students st
      JOIN assignments a ON a.id = ${assignmentId}
      LEFT JOIN assignment_submissions sub ON sub.student_id = st.id AND sub.assignment_id = a.id
      LEFT JOIN quiz_attempts qa ON qa.quiz_id = a.quiz_id AND qa.student_id = st.id
      WHERE st.current_class_id = a.class_id
      ORDER BY st.surname, st.other_names
    `;
  },

  async updateExamTheoryScore(assignmentId: number, studentId: number, submissionId: number | null, theoryScore: number) {
    checkDatabaseConfig();
    if (submissionId) {
      return await sql`
        UPDATE assignment_submissions
        SET theory_score = ${theoryScore},
            score = COALESCE(obj_score, 0) + ${theoryScore},
            status = 'graded',
            updated_at = NOW()
        WHERE id = ${submissionId}
      `;
    } else {
      return await sql`
        INSERT INTO assignment_submissions (
          assignment_id, student_id, theory_score, score, status, submission_date
        ) VALUES (
          ${assignmentId}, ${studentId}, ${theoryScore}, ${theoryScore}, 'graded', NOW()
        )
      `;
    }
  },

  async getAiApiKeys() {
    checkDatabaseConfig();
    return await sql`
      SELECT * FROM ai_api_keys
      ORDER BY priority ASC, created_at DESC
    `;
  },

  async saveAiApiKey(data: { id?: number; provider: string; key_value: string; priority?: number; is_active?: boolean }) {
    checkDatabaseConfig();
    if (data.id) {
      return await sql`
        UPDATE ai_api_keys
        SET provider = ${data.provider},
            key_value = ${data.key_value},
            priority = COALESCE(${data.priority || 0}, priority),
            is_active = COALESCE(${data.is_active !== undefined ? data.is_active : null}, is_active)
        WHERE id = ${data.id}
        RETURNING *
      `;
    } else {
      return await sql`
        INSERT INTO ai_api_keys (provider, key_value, priority, is_active)
        VALUES (${data.provider}, ${data.key_value}, ${data.priority || 0}, ${data.is_active !== undefined ? data.is_active : true})
        RETURNING *
      `;
    }
  },

  async deleteAiApiKey(id: number) {
    checkDatabaseConfig();
    return await sql`DELETE FROM ai_api_keys WHERE id = ${id}`;
  },

  async markApiKeyFailed(id: number) {
    checkDatabaseConfig();
    return await sql`
      UPDATE ai_api_keys
      SET last_failed_at = NOW()
      WHERE id = ${id}
    `;
  },

  // --- Audit Log ---
  async ensureAuditLogTable() {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS audit_log (
          id SERIAL PRIMARY KEY,
          actor_id TEXT NOT NULL,
          actor_name TEXT NOT NULL,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT,
          details TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    } catch (e) {
      console.error('Failed to ensure audit_log table:', e);
    }
  },

  async logAuditEvent(event: {
    actor_id: string;
    actor_name: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    details?: string;
  }) {
    try {
      await this.ensureAuditLogTable();
      await sql`
        INSERT INTO audit_log (actor_id, actor_name, action, entity_type, entity_id, details)
        VALUES (${event.actor_id}, ${event.actor_name}, ${event.action}, ${event.entity_type}, ${event.entity_id || null}, ${event.details || null})
      `;
    } catch (e) {
      console.error('Failed to log audit event:', e);
    }
  },

  async getAuditLogs(filters?: {
    limit?: number;
    offset?: number;
    entity_type?: string;
    actor_id?: string;
    action?: string;
  }) {
    try {
      await this.ensureAuditLogTable();
      let query = sql`SELECT * FROM audit_log WHERE 1=1`;
      if (filters?.entity_type) query = sql`${query} AND entity_type = ${filters.entity_type}`;
      if (filters?.actor_id) query = sql`${query} AND actor_id = ${filters.actor_id}`;
      if (filters?.action) query = sql`${query} AND action = ${filters.action}`;
      query = sql`${query} ORDER BY created_at DESC LIMIT ${filters?.limit || 50} OFFSET ${filters?.offset || 0}`;
      return await query;
    } catch (e) {
      console.error('Failed to fetch audit logs:', e);
      return [];
    }
  },

  async getAuditLogCount(filters?: {
    entity_type?: string;
    actor_id?: string;
    action?: string;
  }) {
    try {
      await this.ensureAuditLogTable();
      let query = sql`SELECT COUNT(*) as count FROM audit_log WHERE 1=1`;
      if (filters?.entity_type) query = sql`${query} AND entity_type = ${filters.entity_type}`;
      if (filters?.actor_id) query = sql`${query} AND actor_id = ${filters.actor_id}`;
      if (filters?.action) query = sql`${query} AND action = ${filters.action}`;
      const result = await query;
      return Number(result[0]?.count || 0);
    } catch {
      return 0;
    }
  },

  // --- Tester Accounts ---
  async ensureTesterColumn() {
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_test_account BOOLEAN DEFAULT false`;
    } catch { /* column may already exist */ }
  },

  async createTesterAccount(name: string, email: string) {
    checkDatabaseConfig();
    await this.ensureTesterColumn();
    const timestamp = Date.now().toString().slice(-6);
    const username = 'TESTER' + timestamp;
    const password = 'test' + Math.floor(1000 + Math.random() * 9000);
    const hash = await bcrypt.hash(password, 10);
    try {
      const result = await sql`
        INSERT INTO users (user_id, password_hash, user_type, full_name, role, is_active, is_test_account)
        VALUES (${username}, ${hash}, 'admin', ${name}, 'admin', true, true)
        RETURNING user_id
      `;
      return { username: result[0].user_id, password };
    } catch (e) {
      console.error('Failed to create tester account:', e);
      throw new Error('Failed to create tester account');
    }
  },

  async getTesterAccounts() {
    await this.ensureTesterColumn();
    try {
      return await sql`
        SELECT id, user_id, full_name, user_type, created_at, last_login
        FROM users WHERE is_test_account = true
        ORDER BY created_at DESC
      `;
    } catch { return []; }
  },

  async deleteTesterAccount(id: number) {
    await sql`DELETE FROM users WHERE id = ${id} AND is_test_account = true`;
  },

  async deleteAllTestAccounts() {
    await this.ensureTesterColumn();
    await sql`DELETE FROM users WHERE is_test_account = true`;
  },

  async seedDemoQuizzes() {
    try {
      const subjects = await sql`SELECT id, name FROM subjects WHERE is_active = true ORDER BY name`;
      if (subjects.length === 0) return { count: 0, message: 'No subjects found.' };

      const existing = await sql`SELECT COUNT(*) as c FROM elearning_quizzes WHERE title LIKE '%[DEMO]%'`;
      if (Number(existing[0]?.c || 0) > 0) return { count: 0, message: 'Demo quizzes already exist.' };

      const classes = await sql`SELECT id, name FROM classes WHERE is_active = true LIMIT 2`;
      let created = 0;
      const questionTemplates: Record<string, { q: string; opts: string[]; ans: number }[]> = {
        math: [
          { q: 'What is 15 × 12?', opts: ['144', '150', '180', '160'], ans: 2 },
          { q: 'Solve for x: 2x + 6 = 20', opts: ['5', '7', '9', '14'], ans: 1 },
          { q: 'What is the square root of 144?', opts: ['11', '12', '13', '14'], ans: 1 },
          { q: 'What is 25% of 200?', opts: ['25', '40', '50', '75'], ans: 2 },
          { q: 'What is the area of a circle with radius 7cm? (π ≈ 22/7)', opts: ['154 cm²', '144 cm²', '164 cm²', '150 cm²'], ans: 0 },
        ],
        english: [
          { q: 'Which word is a synonym for "happy"?', opts: ['Sad', 'Angry', 'Joyful', 'Tired'], ans: 2 },
          { q: 'Choose the correct spelling:', opts: ['Recieve', 'Receive', 'Receeve', 'Receave'], ans: 1 },
          { q: 'What is a noun?', opts: ['An action word', 'A naming word', 'A describing word', 'A joining word'], ans: 1 },
          { q: 'Which sentence is correct?', opts: ['He go to school', 'He goes to school', 'He going to school', 'He gone to school'], ans: 1 },
          { q: 'What is the past tense of "run"?', opts: ['Run', 'Runned', 'Ran', 'Running'], ans: 2 },
        ],
        science: [
          { q: 'What is the chemical symbol for water?', opts: ['H2O', 'CO2', 'NaCl', 'O2'], ans: 0 },
          { q: 'Which planet is known as the Red Planet?', opts: ['Venus', 'Mars', 'Jupiter', 'Saturn'], ans: 1 },
          { q: 'What is the largest organ in the human body?', opts: ['Liver', 'Brain', 'Skin', 'Heart'], ans: 2 },
          { q: 'What gas do plants absorb from the atmosphere?', opts: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], ans: 2 },
          { q: 'What is the boiling point of water in Celsius?', opts: ['90°C', '100°C', '110°C', '120°C'], ans: 1 },
        ],
        social: [
          { q: 'What is the capital of Ghana?', opts: ['Kumasi', 'Accra', 'Takoradi', 'Tamale'], ans: 1 },
          { q: 'Which ocean borders Ghana to the south?', opts: ['Indian Ocean', 'Pacific Ocean', 'Atlantic Ocean', 'Arctic Ocean'], ans: 2 },
          { q: 'What is the main export of Ghana?', opts: ['Oil', 'Gold', 'Cocoa', 'Diamonds'], ans: 2 },
          { q: 'Who was the first President of Ghana?', opts: ['Kwame Nkrumah', 'Jerry Rawlings', 'John Kufuor', 'Kwesi Annan'], ans: 0 },
          { q: 'Which river is the longest in Ghana?', opts: ['Volta', 'Ankobra', 'Tano', 'Pra'], ans: 0 },
        ],
        ict: [
          { q: 'What does CPU stand for?', opts: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Unit', 'Core Processing Unit'], ans: 0 },
          { q: 'Which device is used to store data permanently?', opts: ['RAM', 'Hard Drive', 'CPU', 'Monitor'], ans: 1 },
          { q: 'What is the function of a modem?', opts: ['Display images', 'Connect to internet', 'Process data', 'Store files'], ans: 1 },
          { q: 'Which of these is an input device?', opts: ['Monitor', 'Printer', 'Keyboard', 'Speaker'], ans: 2 },
          { q: 'What does "www" stand for?', opts: ['World Wide Web', 'World Web Wide', 'Web World Wide', 'Wide World Web'], ans: 0 },
        ],
      };

      for (const subject of subjects) {
        const name = subject.name.toLowerCase();
        let templates: { q: string; opts: string[]; ans: number }[] | null = null;
        if (name.includes('math') || name.includes('mathematics')) templates = questionTemplates.math;
        else if (name.includes('english') || name.includes('language') || name.includes('literature')) templates = questionTemplates.english;
        else if (name.includes('science') || name.includes('biology') || name.includes('chemistry') || name.includes('physics')) templates = questionTemplates.science;
        else if (name.includes('social') || name.includes('history') || name.includes('geography') || name.includes('gov') || name.includes('rme')) templates = questionTemplates.social;
        else if (name.includes('ict') || name.includes('comput')) templates = questionTemplates.ict;

        if (!templates) {
          templates = [
            { q: `What is the main focus of ${subject.name}?`, opts: ['Study of numbers', 'Study of language', 'Study of the subject', 'All of the above'], ans: 2 },
            { q: `Which of the following is related to ${subject.name}?`, opts: ['Topic A', 'Topic B', 'Topic C', `All topics in ${subject.name}`], ans: 3 },
            { q: `How many core areas does ${subject.name} cover?`, opts: ['1', '2', '3', 'Multiple'], ans: 3 },
            { q: `${subject.name} is primarily studied at which level?`, opts: ['Primary', 'JHS', 'SHS', 'All levels'], ans: 3 },
            { q: `Which skill is most improved by studying ${subject.name}?`, opts: ['Critical thinking', 'Memory', 'Creativity', 'All of the above'], ans: 3 },
          ];
        }

        const points = 5;
        const classId = classes.length > 0 ? classes[0].id : null;
        const quizResult = await sql`
          INSERT INTO elearning_quizzes (title, description, subject_id, class_id, is_active, shuffle_questions, shuffle_options, show_results_immediately, time_limit, due_date, duration_minutes, total_points, max_attempts)
          VALUES ('[DEMO] ${subject.name} Quiz', 'Demo quiz for ${subject.name}. Take this to test the e-learning system.', ${subject.id}, ${classId}, true, true, true, true, ${30}, ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}, ${10}, ${templates.length * points}, ${5})
          RETURNING id
        `;
        const quizId = quizResult[0].id;

        for (const t of templates) {
          await sql`
            INSERT INTO elearning_quiz_questions (quiz_id, question_text, options, correct_option, points, question_type)
            VALUES (${quizId}, ${t.q}, ${JSON.stringify(t.opts)}, ${t.ans}, ${points}, 'multiple_choice')
          `;
        }

        if (classes.length > 0) {
          await sql`
            INSERT INTO exam_class_assignments (quiz_id, class_id)
            VALUES ${sql.unsafe(classes.map((c: any) => `(${quizId}, ${c.id})`).join(', '))}
          `;
        }

        created++;
      }

      return { count: created, message: `Created ${created} demo quizzes with questions.` };
    } catch (e) {
      console.error('Failed to seed demo quizzes:', e);
      return { count: 0, message: 'Failed to seed demo quizzes.' };
    }
  },

  setReadOnlyMode,
};

// Learning Materials
async function uploadLearningMaterial(materialData: { 
  teacher_id: number;
  class_id: number;
  subject_id: number;
  title: string;
  description: string;
  file_name: string;
  file_path: string;
  file_type: string;
  material_type: string;
  academic_year: string;
}) {
  try {
    const result = await sql`
      INSERT INTO learning_materials (teacher_id, class_id, subject_id, title, description, file_name, file_path, file_type, material_type, academic_year)
      VALUES (${materialData.teacher_id}, ${materialData.class_id}, ${materialData.subject_id}, 
              ${materialData.title}, ${materialData.description}, ${materialData.file_name}, 
              ${materialData.file_path}, ${materialData.file_type}, ${materialData.material_type}, 
              ${materialData.academic_year})
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error uploading learning material:', error);
    throw new Error('Failed to upload learning material');
  }
}

async function getLearningMaterials(filters?: { 
  teacher_id?: number;
  class_id?: number;
  subject_id?: number;
  material_type?: string;
  academic_year?: string;
}) {
  try {
    let query = sql`SELECT lm.*, c.class_name, s.name as subject_name, t.surname as teacher_surname, t.other_names as teacher_other_names
                   FROM learning_materials lm
                   JOIN classes c ON lm.class_id = c.id
                   JOIN subjects s ON lm.subject_id = s.id
                   JOIN teachers t ON lm.teacher_id = t.id
                   WHERE lm.is_active = true`;
    
    if (filters?.teacher_id) {
      query = sql`${query} AND lm.teacher_id = ${filters.teacher_id}`;
    }
    
    if (filters?.class_id) {
      query = sql`${query} AND lm.class_id = ${filters.class_id}`;
    }
    
    if (filters?.subject_id) {
      query = sql`${query} AND lm.subject_id = ${filters.subject_id}`;
    }
    
    if (filters?.material_type) {
      query = sql`${query} AND lm.material_type = ${filters.material_type}`;
    }
    
    if (filters?.academic_year) {
      query = sql`${query} AND lm.academic_year = ${filters.academic_year}`;
    }
    
    query = sql`${query} ORDER BY lm.created_at DESC`;
    
    return await query;
  } catch (error) {
    console.error('Error fetching learning materials:', error);
    return [];
  }
}

async function deleteLearningMaterial(materialId: number) {
  try {
    const result = await sql`
      UPDATE learning_materials 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${materialId}
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error deleting learning material:', error);
    throw new Error('Failed to delete learning material');
  }
}


export { 
  uploadLearningMaterial, 
  getLearningMaterials, 
  deleteLearningMaterial
};

export default db;