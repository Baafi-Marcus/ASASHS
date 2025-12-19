import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { StudentDetailsModal } from '../admin/StudentDetailsModal';

interface TeacherSubject {
  id: number;
  subject_name: string;
  class_name: string;
  form: number;
  stream: string;
  class_id: number;
  subject_id: number;
}

interface ClassStudent {
  id: number;
  student_id: string;
  surname: string;
  other_names: string;
  class_name: string;
  is_active: boolean;
}

interface StudentPerformance {
  id: number;
  academic_year: string;
  term: number;
  class_score: number;
  exam_score: number;
  total_score: number;
  grade: string;
  remarks: string;
  class_name: string;
}

interface TeacherStudentPerformanceProps {
  teacherId: number | string;
}

// Mock data for development
const mockTeacherSubjects: TeacherSubject[] = [
  {
    id: 1,
    subject_name: "Mathematics",
    class_name: "Form 1A",
    form: 1,
    stream: "A",
    class_id: 1,
    subject_id: 1
  },
  {
    id: 2,
    subject_name: "English Language",
    class_name: "Form 1A",
    form: 1,
    stream: "A",
    class_id: 1,
    subject_id: 2
  },
  {
    id: 3,
    subject_name: "Science",
    class_name: "Form 2B",
    form: 2,
    stream: "B",
    class_id: 2,
    subject_id: 3
  }
];

const mockClassStudents: ClassStudent[] = [
  {
    id: 1,
    student_id: "STU2023001",
    surname: "Johnson",
    other_names: "Michael",
    class_name: "Form 1A",
    is_active: true
  },
  {
    id: 2,
    student_id: "STU2023002",
    surname: "Williams",
    other_names: "Sarah",
    class_name: "Form 1A",
    is_active: true
  },
  {
    id: 3,
    student_id: "STU2023003",
    surname: "Brown",
    other_names: "David",
    class_name: "Form 1A",
    is_active: true
  }
];

const mockStudentPerformance: StudentPerformance[] = [
  {
    id: 1,
    academic_year: "2023/2024",
    term: 1,
    class_score: 25.5,
    exam_score: 65.0,
    total_score: 90.5,
    grade: "A1",
    remarks: "Excellent work",
    class_name: "Form 1A"
  },
  {
    id: 2,
    academic_year: "2023/2024",
    term: 2,
    class_score: 22.0,
    exam_score: 58.0,
    total_score: 80.0,
    grade: "A2",
    remarks: "Good performance",
    class_name: "Form 1A"
  },
  {
    id: 3,
    academic_year: "2022/2023",
    term: 3,
    class_score: 20.0,
    exam_score: 55.0,
    total_score: 75.0,
    grade: "B2",
    remarks: "Satisfactory",
    class_name: "Form 1A"
  }
];

export const TeacherStudentPerformance: React.FC<TeacherStudentPerformanceProps> = ({ teacherId }) => {
  // Ensure teacherId is a number
  const numericTeacherId = typeof teacherId === 'string' ? parseInt(teacherId) : teacherId;
  
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<ClassStudent | null>(null);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Debugging - log when component mounts and receives props
  useEffect(() => {
    console.log('TeacherStudentPerformance component mounted with teacherId:', teacherId, 'numericTeacherId:', numericTeacherId);
  }, [teacherId, numericTeacherId]);

  useEffect(() => {
    // Check if we should use mock data (for development)
    // In Vite, environment variables must be prefixed with VITE_ to be accessible on the client side
    const shouldUseMockData = (!import.meta.env.VITE_DATABASE_URL && !import.meta.env.DATABASE_URL) && typeof window !== 'undefined';
    setUseMockData(shouldUseMockData);
    
    console.log('Database URL check:', {
      VITE_DATABASE_URL: import.meta.env.VITE_DATABASE_URL,
      DATABASE_URL: import.meta.env.DATABASE_URL,
      shouldUseMockData
    });
    
    fetchTeacherSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass);
      // Reset student selection when class changes
      setSelectedStudent(null);
      setStudentPerformance([]);
    }
  }, [selectedClass]);

  const fetchTeacherSubjects = async () => {
    try {
      console.log('Fetching teacher subjects for teacherId:', numericTeacherId);
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        console.log('Using mock data');
        // Use mock data for development
        setTeacherSubjects(mockTeacherSubjects);
        
        // Auto-select the first class and subject if available
        if (mockTeacherSubjects.length > 0) {
          setSelectedClass(mockTeacherSubjects[0].class_id);
          setSelectedSubject(mockTeacherSubjects[0].subject_id);
        } else {
          setError("You don't have any classes or subjects assigned yet. Please contact your administrator.");
        }
      } else {
        console.log('Using database connection');
        // Use actual database connections
        const subjects = await db.getTeacherSubjects(numericTeacherId);
        console.log('Retrieved subjects:', subjects);
        setTeacherSubjects(subjects as TeacherSubject[]);
        
        // Auto-select the first class and subject if available
        if (subjects.length > 0) {
          setSelectedClass(subjects[0].class_id);
          setSelectedSubject(subjects[0].subject_id);
        } else {
          setError("You don't have any classes or subjects assigned yet. Please contact your administrator.");
        }
      }
    } catch (error) {
      console.error('Failed to fetch teacher subjects:', error);
      setError('Failed to load subjects. Please try again later.');
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async (classId: number) => {
    try {
      console.log('Fetching class students for classId:', classId);
      if (useMockData) {
        // Use mock data for development
        setClassStudents(mockClassStudents);
        
        if (mockClassStudents.length === 0) {
          toast.success('No students found in this class'); // Using success instead of info
        }
      } else {
        // Use actual database connections
        const students = await db.getClassStudents(classId);
        console.log('Retrieved students:', students);
        setClassStudents(students as ClassStudent[]);
        
        if (students.length === 0) {
          toast.success('No students found in this class'); // Using success instead of info
        }
      }
    } catch (error) {
      console.error('Failed to fetch class students:', error);
      toast.error('Failed to load students');
    }
  };

  const fetchStudentPerformance = async (studentId: number, subjectId: number) => {
    console.log('Fetching student performance for studentId:', studentId, 'subjectId:', subjectId);
    if (!subjectId) {
      toast.error('Please select a subject first');
      return;
    }
    
    setPerformanceLoading(true);
    try {
      if (useMockData) {
        // Use mock data for development
        setStudentPerformance(mockStudentPerformance);
        
        if (mockStudentPerformance.length === 0) {
          toast.success('No performance data available for this student in the selected subject'); // Using success instead of info
        }
      } else {
        // Use actual database connections
        const performance = await db.getStudentPerformanceHistory(studentId, subjectId);
        console.log('Retrieved performance:', performance);
        setStudentPerformance(performance as StudentPerformance[]);
        
        if (performance.length === 0) {
          toast.success('No performance data available for this student in the selected subject'); // Using success instead of info
        }
      }
    } catch (error) {
      console.error('Failed to fetch student performance:', error);
      toast.error('Failed to load student performance');
    } finally {
      setPerformanceLoading(false);
    }
  };

  const handleViewPerformance = (student: ClassStudent) => {
    console.log('Handling view performance for student:', student);
    setSelectedStudent(student);
    if (selectedSubject) {
      fetchStudentPerformance(student.id, selectedSubject);
    } else {
      toast.error('Please select a subject first');
    }
  };

  const handleViewStudentDetails = (studentId: number) => {
    setSelectedStudentId(studentId);
    setIsEditing(false);
    setShowStudentDetails(true);
  };

  const handleStudentModalClose = () => {
    setShowStudentDetails(false);
    setSelectedStudentId(null);
  };

  // Group subjects by class
  const groupedSubjects = teacherSubjects.reduce((acc, subject) => {
    const classKey = `${subject.class_name}`;
    if (!acc[classKey]) {
      acc[classKey] = {
        className: subject.class_name,
        form: subject.form,
        stream: subject.stream,
        classId: subject.class_id,
        subjects: [] as TeacherSubject[]
      };
    }
    acc[classKey].subjects.push(subject);
    return acc;
  }, {} as Record<string, { className: string; form: number; stream: string; classId: number; subjects: TeacherSubject[] }>);

  // Get unique subjects for the selected class
  const getSubjectsForSelectedClass = () => {
    if (!selectedClass) return [];
    return teacherSubjects.filter(subject => subject.class_id === selectedClass);
  };

  // Check if we have any data to display
  const hasData = teacherSubjects.length > 0 || classStudents.length > 0 || studentPerformance.length > 0;

  if (loading) {
    console.log('Component is loading...');
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  if (error) {
    console.log('Component has error:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-center">
          <div className="text-red-600 mr-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchTeacherSubjects}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering main component with data:', {
    teacherSubjects,
    selectedClass,
    selectedSubject,
    classStudents,
    selectedStudent,
    studentPerformance,
    hasData,
    useMockData
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Class Performance Analytics</h2>
          <p className="text-gray-600">View and track student performance in your assigned classes</p>
        </div>
        {useMockData && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg">
            <span className="font-medium">Mock Data Mode</span> - Database not connected
          </div>
        )}
      </div>

      {/* Class and Subject Selection */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
            >
              <option value="">Choose a class</option>
              {Object.entries(groupedSubjects).map(([classKey, classData]) => (
                <option key={classKey} value={classData.classId}>
                  {classData.className} (Form {classData.form}{classData.stream})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
            <select
              value={selectedSubject || ''}
              onChange={(e) => setSelectedSubject(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
              disabled={!selectedClass}
            >
              <option value="">Choose a subject</option>
              {getSubjectsForSelectedClass().map((subject) => (
                <option key={subject.id} value={subject.subject_id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Warning if no subjects are available */}
        {teacherSubjects.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <div className="text-yellow-600 mr-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-yellow-700">
                You don't have any classes or subjects assigned yet. Please contact your administrator to assign classes and subjects to your account.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students List */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
          <div className="bg-school-green-600 text-white p-6">
            <h3 className="text-xl font-bold">Class Students</h3>
            <p className="text-school-green-100">
              {classStudents.length} students enrolled
            </p>
          </div>
          
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="bg-school-cream-100 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Student ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-school-cream-200">
                {classStudents.length > 0 ? (
                  classStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-school-cream-50 transition-colors cursor-pointer ${
                        selectedStudent?.id === student.id ? 'bg-school-green-50' : ''
                      }`}
                      onClick={() => handleViewPerformance(student)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.student_id}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.surname}, {student.other_names}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <button 
                            className="text-school-green-600 hover:text-school-green-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPerformance(student);
                            }}
                          >
                            View Performance
                          </button>
                          <button 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewStudentDetails(student.id);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <div className="text-4xl mb-4">👥</div>
                        <p className="text-lg font-medium">No students found</p>
                        <p className="text-sm">Select a class to view students</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Performance */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
          <div className="bg-blue-600 text-white p-6">
            <h3 className="text-xl font-bold">
              {selectedStudent 
                ? `${selectedStudent.surname}, ${selectedStudent.other_names} - Performance` 
                : 'Student Performance'}
            </h3>
            <p className="text-blue-100">
              {selectedStudent ? selectedStudent.student_id : 'Select a student to view performance'}
            </p>
          </div>
          
          {performanceLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          ) : selectedStudent ? (
            <div className="p-6">
              {studentPerformance.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Academic Year</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Term</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Class Score</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Exam Score</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Total</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-100">
                        {studentPerformance.map((performance) => (
                          <tr key={`${performance.academic_year}-${performance.term}`} className="hover:bg-blue-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{performance.academic_year}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">Term {performance.term}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{performance.class_score?.toFixed(1) || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{performance.exam_score?.toFixed(1) || '-'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{performance.total_score?.toFixed(1) || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                performance.grade === 'A1' ? 'bg-green-100 text-green-800' :
                                performance.grade === 'B2' ? 'bg-blue-100 text-blue-800' :
                                performance.grade === 'B3' ? 'bg-blue-100 text-blue-800' :
                                performance.grade === 'C4' ? 'bg-yellow-100 text-yellow-800' :
                                performance.grade === 'C5' ? 'bg-yellow-100 text-yellow-800' :
                                performance.grade === 'C6' ? 'bg-yellow-100 text-yellow-800' :
                                performance.grade === 'D7' ? 'bg-orange-100 text-orange-800' :
                                performance.grade === 'E8' ? 'bg-red-100 text-red-800' :
                                performance.grade === 'F9' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {performance.grade || '-'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Performance Summary */}
                  <div className="bg-blue-50 rounded-xl p-4 mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Performance Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {studentPerformance.length}
                        </div>
                        <div className="text-sm text-gray-600">Records</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {studentPerformance.length > 0 
                            ? (studentPerformance.reduce((sum, p) => sum + (p.total_score || 0), 0) / studentPerformance.length).toFixed(1)
                            : '0.0'}
                        </div>
                        <div className="text-sm text-gray-600">Average</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-green-600">
                          {studentPerformance.filter(p => p.grade && ['A1', 'B2', 'B3'].includes(p.grade)).length}
                        </div>
                        <div className="text-sm text-gray-600">A-B Grades</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-red-600">
                          {studentPerformance.filter(p => p.grade && ['D7', 'E8', 'F9'].includes(p.grade)).length}
                        </div>
                        <div className="text-sm text-gray-600">D-F Grades</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-lg font-medium text-gray-900">No performance data available</p>
                  <p className="text-gray-600 mt-2">
                    No results recorded for this student in the selected subject yet.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👤</div>
              <p className="text-lg font-medium text-gray-900">Select a student</p>
              <p className="text-gray-600 mt-2">
                Choose a student from the list to view their performance details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Class Performance Overview */}
      {selectedClass && selectedSubject && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
          <div className="bg-amber-600 text-white p-6">
            <h3 className="text-xl font-bold">Class Performance Overview</h3>
            <p className="text-amber-100">
              {getSubjectsForSelectedClass().find(s => s.subject_id === selectedSubject)?.subject_name} - {
                Object.values(groupedSubjects).find(c => c.classId === selectedClass)?.className
              }
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                <div className="text-3xl font-bold text-amber-800">
                  {classStudents.length}
                </div>
                <div className="text-amber-600">Total Students</div>
              </div>
              
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                <div className="text-3xl font-bold text-amber-800">
                  {studentPerformance.length > 0 
                    ? (studentPerformance.reduce((sum, p) => sum + (p.total_score || 0), 0) / studentPerformance.length).toFixed(1)
                    : '0.0'}
                </div>
                <div className="text-amber-600">Class Average</div>
              </div>
              
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                <div className="text-3xl font-bold text-amber-800">
                  {studentPerformance.filter(p => p.total_score >= 50).length}
                </div>
                <div className="text-amber-600">Passing Students</div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Performance Distribution</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>A1-A2 (Excellent)</span>
                    <span>{studentPerformance.filter(p => p.grade && ['A1', 'A2'].includes(p.grade)).length} students</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${studentPerformance.length > 0 ? (studentPerformance.filter(p => p.grade && ['A1', 'A2'].includes(p.grade)).length / studentPerformance.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>B2-B3 (Good)</span>
                    <span>{studentPerformance.filter(p => p.grade && ['B2', 'B3'].includes(p.grade)).length} students</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${studentPerformance.length > 0 ? (studentPerformance.filter(p => p.grade && ['B2', 'B3'].includes(p.grade)).length / studentPerformance.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>C4-C6 (Satisfactory)</span>
                    <span>{studentPerformance.filter(p => p.grade && ['C4', 'C5', 'C6'].includes(p.grade)).length} students</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${studentPerformance.length > 0 ? (studentPerformance.filter(p => p.grade && ['C4', 'C5', 'C6'].includes(p.grade)).length / studentPerformance.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>D7-F9 (Needs Improvement)</span>
                    <span>{studentPerformance.filter(p => p.grade && ['D7', 'E8', 'F9'].includes(p.grade)).length} students</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${studentPerformance.length > 0 ? (studentPerformance.filter(p => p.grade && ['D7', 'E8', 'F9'].includes(p.grade)).length / studentPerformance.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudentId && (
        <StudentDetailsModal
          studentId={selectedStudentId}
          isOpen={showStudentDetails}
          onClose={handleStudentModalClose}
          onStudentUpdated={() => {}} // No need to refresh anything in teacher view
          programmes={[]} // Teachers don't need to edit programmes
          classes={[]} // Teachers don't need to edit classes
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      )}
    </div>
  );
};