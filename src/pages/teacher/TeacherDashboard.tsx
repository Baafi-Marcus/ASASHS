import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalHeader } from '../../components/PortalHeader';
import { PortalSidebar } from '../../components/PortalSidebar';
import { PortalCard } from '../../components/PortalCard';
import { TeacherClasses } from './TeacherClasses';
import { TeacherAssignments } from './TeacherAssignments';
import { TeacherGradebook } from './TeacherGradebook';
import { TeacherStudentPerformance } from './TeacherStudentPerformance';
import { TeacherMessages } from './TeacherMessages';
import { TeacherProfile } from './TeacherProfile';

interface Teacher {
  id: string;
  teacherId: string;
  teacherDbId: number;
  fullName: string;
  subjects: string[];
  classes: string[];
  department: string;
}

interface TeacherDashboardProps {
  teacher: Teacher;
  onLogout: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teacher, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [stats, setStats] = useState({
    studentsCount: 0,
    pendingGrades: 0,
    upcomingExams: 0
  });
  const [loading, setLoading] = useState(true);

  // Sidebar items for teacher portal
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    )},
    { id: 'classes', label: 'My Classes', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
    { id: 'assignments', label: 'Assignments', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: 'grades', label: 'Gradebook', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: 'performance', label: 'Performance', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: 'messages', label: 'Messages', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )},
    { id: 'profile', label: 'My Profile', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch teacher's subjects and classes
      const teacherSubjects: any[] = await db.getTeacherSubjects(teacher.teacherDbId);
      
      // Get unique class IDs
      const classIdSet = new Set<number>();
      teacherSubjects.forEach((subject: any) => {
        const classId = Number(subject.class_id);
        if (!isNaN(classId)) {
          classIdSet.add(classId);
        }
      });
      const classIds: number[] = Array.from(classIdSet);
      
      // Fetch students for each class and count total
      let totalStudents = 0;
      const studentIds = new Set();
      
      for (let i = 0; i < classIds.length; i++) {
        const classId = classIds[i];
        const classStudents = await db.getClassStudents(classId);
        classStudents.forEach((student: any) => {
          studentIds.add(student.id);
        });
      }
      
      totalStudents = studentIds.size;
      
      // Fetch assignments to count pending grades and upcoming exams
      const assignmentsData = await db.getAssignmentsByTeacher(teacher.teacherDbId);
      
      // Count pending grades (assignments without submissions)
      let pendingGrades = 0;
      for (const assignment of assignmentsData) {
        const submissions = await db.getAssignmentSubmissions(assignment.id);
        // In a real implementation, we would check for ungraded submissions
        // For now, we'll use the assignment count as a proxy
        pendingGrades += submissions.length;
      }
      
      // Count upcoming exams (assignments with type 'Exam' or 'Midsem Exam')
      let upcomingExams = 0;
      const examAssignments = assignmentsData.filter((assignment: any) => 
        assignment.assignment_type === 'Exam' || assignment.assignment_type === 'Midsem Exam'
      );
      upcomingExams = examAssignments.length;
      
      // Set real statistics
      setStats({
        studentsCount: totalStudents,
        pendingGrades: pendingGrades,
        upcomingExams: upcomingExams
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Set fallback stats
      setStats({
        studentsCount: 0,
        pendingGrades: 0,
        upcomingExams: 0
      });
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
            <h2 className="text-2xl font-bold text-gray-900">Welcome back, {teacher.fullName}!</h2>
            <p className="text-gray-600 mt-1">Here's what's happening in your classes today.</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="bg-school-cream-100 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Teacher ID</span>
                <div className="font-semibold">{teacher.teacherId}</div>
              </div>
              <div className="bg-school-cream-100 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Department</span>
                <div className="font-semibold">{teacher.department}</div>
              </div>
              <div className="bg-school-cream-100 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Classes</span>
                <div className="font-semibold">{teacher.classes.length}</div>
              </div>
            </div>
          </div>
        </div>
      </PortalCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PortalCard className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.studentsCount || 0}</h3>
              <p className="text-gray-600">Students</p>
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
              <h3 className="text-2xl font-bold text-gray-900">{stats.pendingGrades || 0}</h3>
              <p className="text-gray-600">Pending Grades</p>
            </div>
          </div>
        </PortalCard>

        <PortalCard className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.upcomingExams || 0}</h3>
              <p className="text-gray-600">Upcoming Exams</p>
            </div>
          </div>
        </PortalCard>
      </div>

      {/* Quick Actions */}
      <PortalCard title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveTab('classes')}
            className="flex flex-col items-center p-4 bg-school-cream-50 rounded-xl hover:bg-school-cream-100 transition-colors"
          >
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">My Classes</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('assignments')}
            className="flex flex-col items-center p-4 bg-school-cream-50 rounded-xl hover:bg-school-cream-100 transition-colors"
          >
            <div className="bg-green-100 p-3 rounded-full mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Assignments</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('grades')}
            className="flex flex-col items-center p-4 bg-school-cream-50 rounded-xl hover:bg-school-cream-100 transition-colors"
          >
            <div className="bg-purple-100 p-3 rounded-full mb-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Gradebook</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('messages')}
            className="flex flex-col items-center p-4 bg-school-cream-50 rounded-xl hover:bg-school-cream-100 transition-colors"
          >
            <div className="bg-yellow-100 p-3 rounded-full mb-2">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Messages</span>
          </button>
        </div>
      </PortalCard>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': 
        return renderOverview();
      case 'classes': 
        return <TeacherClasses teacherId={teacher.teacherDbId} />;
      case 'assignments': 
        return <TeacherAssignments teacherId={teacher.teacherDbId} />;
      case 'grades': 
        return <TeacherGradebook teacherId={teacher.teacherDbId} />;
      case 'performance': 
        return <TeacherStudentPerformance teacherId={teacher.teacherDbId} />;
      case 'messages': 
        return <TeacherMessages teacherId={teacher.teacherDbId} />;
      case 'profile': 
        return <TeacherProfile teacher={teacher} onLogout={onLogout} />;
      default: 
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-school-cream-50 flex flex-col">
      <PortalHeader 
        portalName="Teacher" 
        userName={teacher.fullName} 
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
                {activeTab === 'classes' && 'My Classes'}
                {activeTab === 'assignments' && 'Assignments'}
                {activeTab === 'grades' && 'Gradebook'}
                {activeTab === 'performance' && 'Student Performance'}
                {activeTab === 'messages' && 'Messages'}
                {activeTab === 'profile' && 'My Profile'}
              </h1>
              <p className="text-gray-600">
                {activeTab === 'overview' && 'Your teaching dashboard overview'}
                {activeTab === 'classes' && 'Manage your classes and students'}
                {activeTab === 'assignments' && 'Create and manage assignments'}
                {activeTab === 'grades' && 'Grade student assignments and exams'}
                {activeTab === 'performance' && 'Track student performance analytics'}
                {activeTab === 'messages' && 'Communicate with students and parents'}
                {activeTab === 'profile' && 'Manage your profile and account settings'}
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

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Sign Out</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to sign out of your account?</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};