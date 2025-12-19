import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import db from '../../lib/neon';

interface Student {
  id: string;
  studentId: string;
  fullName: string;
  className: string;
  house: string;
  form: number;
  course: string;
  profilePicture?: string;
}

interface StudentAuthContextType {
  student: Student | null;
  loading: boolean;
  login: (studentId: string, password: string) => Promise<void>;
  logout: () => void;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (context === undefined) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};

interface StudentAuthProviderProps {
  children: React.ReactNode;
}

export const StudentAuthProvider: React.FC<StudentAuthProviderProps> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const authenticateStudent = async (studentId: string, password: string): Promise<Student> => {
    try {
      const authenticatedUser = await db.authenticateUser(studentId, password);
      
      if (!authenticatedUser || authenticatedUser.user_type !== 'student') {
        throw new Error('Invalid credentials');
      }

      // Get additional student details (only active students)
      const studentDetails = await db.getStudents({ search: authenticatedUser.student_id, includeInactive: false });
      const studentData = studentDetails[0];

      if (!studentData) {
        throw new Error('Student details not found');
      }

      // Extract form number from class name if available
      let form = 1;
      let className = 'Not assigned';
      
      if (studentData.class_name) {
        className = studentData.class_name;
        // Extract form number from class name (e.g., "Science 1A" -> form 1)
        const formMatch = studentData.class_name.match(/(\d+)/);
        if (formMatch) {
          form = parseInt(formMatch[1]);
        }
      }

      return {
        id: studentData.id.toString(), // Student database ID
        studentId: authenticatedUser.student_id,
        fullName: `${studentData.surname}, ${studentData.other_names}`,
        className: className,
        house: studentData.house_preference && studentData.house_preference.trim() !== '' ? studentData.house_preference : 'Not assigned',
        form: form,
        course: studentData.course_name || 'Not assigned'
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Invalid credentials');
    }
  };

  const login = async (studentId: string, password: string) => {
    try {
      setLoading(true);
      const authenticatedStudent = await authenticateStudent(studentId, password);
      setStudent(authenticatedStudent);
      
      // Store in localStorage for persistence
      localStorage.setItem('studentAuth', JSON.stringify({
        studentData: authenticatedStudent,
        timestamp: Date.now()
      }));
      
      toast.success(`Welcome back, ${authenticatedStudent.fullName}!`);
    } catch (error) {
      toast.error('Invalid Student ID or password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem('studentAuth');
    toast.success('Successfully signed out');
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedAuth = localStorage.getItem('studentAuth');
        if (savedAuth) {
          const { studentData, timestamp } = JSON.parse(savedAuth);
          
          // Check if session is less than 24 hours old
          const sessionAge = Date.now() - timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge < maxAge && studentData) {
            // Restore the student session
            setStudent(studentData);
          } else {
            // Session expired or invalid
            localStorage.removeItem('studentAuth');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('studentAuth');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const value: StudentAuthContextType = {
    student,
    loading,
    login,
    logout
  };

  return (
    <StudentAuthContext.Provider value={value}>
      {children}
    </StudentAuthContext.Provider>
  );
};