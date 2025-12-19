import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { PortalHeader } from '../../components/PortalHeader';
import { PortalSidebar } from '../../components/PortalSidebar';
import { PortalCard } from '../../components/PortalCard';
import { StudentProfile } from './StudentProfile';
import { StudentBehavior } from './StudentBehavior';
import { StudentDownloads } from './StudentDownloads';
import { StudentMessages } from './StudentMessages';

// Updated Student interface to match what's provided by StudentAuthContext
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

interface Subject {
  id: number;
  name: string;
  code: string;
  class_id: number;
  teacher_id: number;
  teacher_name: string;
}

interface Result {
  id: number;
  student_id: number;
  subject_id: number;
  class_id: number;
  score: number;
  grade: string;
  remark: string;
  academic_year: string;
  form: number;
  subject_name: string;
  subject_code: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  class_id: number;
  subject_id: number;
  assignment_type: string;
  file_path: string | null;
  created_at: string;
  subject_name: string;
}

export const StudentDashboard: React.FC<{ 
  student: Student; 
  onLogout: () => void;
}> = ({ student, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [semester, setSemester] = useState(1);
  const [term, setTerm] = useState(1); // Map semester to term (semester 1 = term 1, semester 2 = term 2)

  // Sidebar items for student portal
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    )},
    { id: 'profile', label: 'My Profile', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'grades', label: 'My Grades', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: 'assignments', label: 'Assignments', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: 'behavior', label: 'Behavior', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { id: 'downloads', label: 'Downloads', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    )},
    { id: 'messages', label: 'Messages', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )},
  ];

  // Fetch data from database
  useEffect(() => {
    // Map semester to term (semester 1 = term 1, semester 2 = term 2)
    setTerm(semester);
  }, [semester]);

  useEffect(() => {
    fetchData();
  }, [academicYear, term]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Convert student.id (string) to number for database queries
      const studentDbId = parseInt(student.id);
      
      // Fetch student's subjects for the current class
      const studentSubjects = await db.getStudentSubjects(studentDbId);
      setSubjects(studentSubjects);
      
      // Fetch student's results for the selected academic year and term
      const studentResults = await db.getStudentResults(studentDbId, academicYear, term);
      setResults(studentResults);
      
      // Fetch assignments for the student's class
      // We'll need to get the actual class ID - for now using a placeholder approach
      // In a real implementation, we would get this from the student data
      const classAssignments = await db.getAssignmentsByClass(1); // Placeholder
      setAssignments(classAssignments);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Card */}
      <PortalCard>
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-6">
          <div className="bg-school-green-100 p-4 rounded-xl">
            <svg className="w-12 h-12 text-school-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back, {student.fullName}!</h2>
            <p className="text-gray-600 mt-1">Here's your academic dashboard for this semester.</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="bg-school-cream-100 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Student ID</span>
                <div className="font-semibold">{student.studentId}</div>
              </div>
              <div className="bg-school-cream-100 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Course</span>
                <div className="font-semibold">{student.course}</div>
              </div>
              <div className="bg-school-cream-100 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Class</span>
                <div className="font-semibold">{student.className}</div>
              </div>
            </div>
          </div>
        </div>
      </PortalCard>

      {/* Academic Year and Semester Selector */}
      <PortalCard title="Academic Period">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <select 
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-school-green-500 focus:border-school-green-500"
            >
              <option value="2024">2024/2025</option>
              <option value="2025">2025/2026</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select 
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-school-green-500 focus:border-school-green-500"
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>
        </div>
      </PortalCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PortalCard className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{subjects.length}</h3>
              <p className="text-gray-600">Subjects</p>
            </div>
          </div>
        </PortalCard>

        <PortalCard className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{results.filter(r => r.grade).length}</h3>
              <p className="text-gray-600">Graded Results</p>
            </div>
          </div>
        </PortalCard>

        <PortalCard className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{assignments.length}</h3>
              <p className="text-gray-600">Assignments</p>
            </div>
          </div>
        </PortalCard>
      </div>

      {/* Recent Assignments */}
      {assignments.length > 0 && (
        <PortalCard title="Recent Assignments">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.slice(0, 3).map((assignment) => (
              <div key={assignment.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 text-sm">{assignment.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    assignment.assignment_type === 'Assignment' ? 'bg-blue-100 text-blue-800' :
                    assignment.assignment_type === 'Midsem Exam' ? 'bg-purple-100 text-purple-800' :
                    assignment.assignment_type === 'Exam' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {assignment.assignment_type}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{assignment.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </div>
                  {assignment.file_path && (
                    <button className="text-xs text-school-green-600 hover:text-school-green-700 font-medium">
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </PortalCard>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': 
        return renderOverview();
      case 'profile': 
        return <StudentProfile student={student} onLogout={onLogout} />;
      case 'grades': 
        return (
          <PortalCard title="My Grades">
            {results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result) => (
                      <tr key={result.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{result.subject_name}</div>
                          <div className="text-sm text-gray-500">{result.subject_code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.score !== null ? result.score : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            result.grade === 'A' ? 'bg-green-100 text-green-800' :
                            result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                            result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                            result.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                            result.grade === 'E' ? 'bg-red-100 text-red-800' :
                            result.grade === 'F' ? 'bg-red-200 text-red-900' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {result.grade || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.remark || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No grades available</h3>
                <p className="mt-1 text-sm text-gray-500">No grades have been recorded for the selected period.</p>
              </div>
            )}
          </PortalCard>
        );
      case 'assignments': 
        return (
          <PortalCard title="Assignments">
            {assignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        assignment.assignment_type === 'Assignment' ? 'bg-blue-100 text-blue-800' :
                        assignment.assignment_type === 'Midsem Exam' ? 'bg-purple-100 text-purple-800' :
                        assignment.assignment_type === 'Exam' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.assignment_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{assignment.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                      {assignment.file_path && (
                        <button className="text-sm text-school-green-600 hover:text-school-green-700 font-medium">
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
                <p className="mt-1 text-sm text-gray-500">No assignments have been posted for your class.</p>
              </div>
            )}
          </PortalCard>
        );
      case 'behavior': 
        return <StudentBehavior studentId={parseInt(student.id)} />;
      case 'downloads': 
        return <StudentDownloads />;
      case 'messages': 
        return <StudentMessages />;
      default: 
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-school-cream-50 flex flex-col">
      <PortalHeader 
        portalName="Student" 
        userName={student.fullName} 
        onLogout={onLogout} 
      />
      
      <div className="flex flex-1">
        <PortalSidebar 
          items={sidebarItems} 
          activeItem={activeTab} 
          onItemClick={setActiveTab} 
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'profile' && 'My Profile'}
                {activeTab === 'grades' && 'My Grades'}
                {activeTab === 'assignments' && 'Assignments'}
                {activeTab === 'behavior' && 'Behavior Records'}
                {activeTab === 'downloads' && 'Downloads'}
                {activeTab === 'messages' && 'Messages'}
              </h1>
              <p className="text-gray-600">
                {activeTab === 'overview' && 'Your academic dashboard overview'}
                {activeTab === 'profile' && 'Manage your profile and personal information'}
                {activeTab === 'grades' && 'View your academic results and grades'}
                {activeTab === 'assignments' && 'View and manage your assignments'}
                {activeTab === 'behavior' && 'View your behavior records and conduct'}
                {activeTab === 'downloads' && 'Download learning materials and resources'}
                {activeTab === 'messages' && 'Communicate with teachers and school administration'}
              </p>
            </div>
            
            {loading && activeTab === 'overview' ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </main>
      </div>
    </div>
  );
};