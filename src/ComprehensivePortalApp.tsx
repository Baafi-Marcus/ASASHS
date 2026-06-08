import React, { useState, useEffect, useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import { SchoolLandingPage } from './pages/SchoolLandingPage';
import { NewsEventsPage } from './pages/NewsEventsPage';
import { StaffDirectoryPage } from './pages/StaffDirectoryPage';
import { AcademicCalendarPage } from './pages/AcademicCalendarPage';
import { LandingNavbar } from './components/LandingNavbar';
import { UnifiedLogin } from './pages/UnifiedLogin';
import { PortalLayout } from './components/PortalLayout';

// Shared Components
import { AuthContext } from '../AuthContext';
import LoginForm from '../LoginForm';
import db from '../lib/neon';

// Admin Portal Components
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSubAdminManagement } from './pages/admin/AdminSubAdminManagement';
import { AdminSchoolExams } from './pages/admin/AdminSchoolExams';
import { AdminExamReports } from './pages/admin/AdminExamReports';
import { AdminStudentManagement } from './pages/admin/AdminStudentManagement';
import { AdminTeacherManagement } from './pages/admin/AdminTeacherManagement';
import { CourseManagement } from './pages/admin/CourseManagement';
import { AdminTimetableManagement } from './pages/admin/AdminTimetableManagement';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherExams } from './pages/teacher/TeacherExams';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminBehaviorRecords } from './pages/admin/AdminBehaviorRecords';
import { AdminStudentPerformance } from './pages/admin/AdminStudentPerformance';
import { AdminElectionManagement } from './pages/admin/AdminElectionManagement';
import { ICTRegistrationPortal } from './pages/admin/ICTRegistrationPortal';
import { AdminAiSettings } from './pages/admin/AdminAiSettings';
import SystemOversight from './pages/admin/SystemOversight';
import { StudentELearning } from './pages/student/StudentELearning';
import { StudentExams } from './pages/student/StudentExams';
import { QuizRunner } from './pages/student/QuizRunner';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminProfile } from './pages/admin/AdminProfile';

// Student Portal Components
import { StudentDashboard } from './pages/student/StudentDashboard';

// Teacher Portal Components

function ComprehensivePortalApp() {
  const { user, signIn, signOut, loading } = useContext(AuthContext);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showNewsPage, setShowNewsPage] = useState(false);
  const [showStaffPage, setShowStaffPage] = useState(false);
  const [showCalendarPage, setShowCalendarPage] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hasActiveElection, setHasActiveElection] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    // Reset active tab when user role changes or user logs in
    if (user) {
      if (user.user_type === 'admin' || user.user_type === 'teacher') {
        setActiveTab('dashboard');
      } else if (user.user_type === 'student') {
        setActiveTab('overview');
      }
      setShowLandingPage(false);
    }
  }, [user?.user_type]);

  useEffect(() => {
    // Check for hidden admin route
    if (window.location.pathname === '/admin_asashs') {
      setShowLandingPage(false);
      return;
    }
  }, []);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const mode = await db.getMaintenanceMode();
        setMaintenanceMode(mode);
      } catch (error) {
        console.error('Failed to check maintenance mode:', error);
      }
    };
    checkMaintenance();
  }, []);

  useEffect(() => {
    const checkActiveElection = async () => {
      try {
        const elections = await db.getElections();
        const active = elections.some((e: any) => e.status === 'open');
        setHasActiveElection(active);
      } catch (error) {
        console.error('Failed to check active elections:', error);
      }
    };
    checkActiveElection();
  }, []);

  const goToLogin = () => {
    setShowLandingPage(false);
    setShowNewsPage(false);
    setShowStaffPage(false);
    setShowCalendarPage(false);
  };

  const handleBackToLanding = () => {
    setShowLandingPage(true);
    setShowNewsPage(false);
    setShowStaffPage(false);
    setShowCalendarPage(false);
    if (window.location.pathname === '/admin_asashs') {
        window.history.pushState({}, '', '/');
    }
  };

  // --- Standalone Quiz Mode (opened in new tab) ---
  const urlParams = new URLSearchParams(window.location.search);
  const takeQuiz = urlParams.get('takeQuiz');
  const quizIdParam = urlParams.get('quizId');

  if (takeQuiz === '1' && quizIdParam) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-school-cream-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
        </div>
      );
    }
    if (!user || user.user_type !== 'student') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-school-cream-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Authentication Required</h2>
            <p className="text-gray-500">Please log in as a student to access this exam.</p>
            <button onClick={() => window.location.href = window.location.origin + window.location.pathname} className="px-6 py-2 bg-school-green-600 text-white rounded-xl font-bold">
              Go to Login
            </button>
          </div>
        </div>
      );
    }
    const studentId = user.student_db_id || 0;
    return <QuizRunner studentId={studentId} quizId={parseInt(quizIdParam)} onClose={() => window.close()} standalone />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  // --- LOGGED IN VIEW ---
  if (user) {
    // --- MAINTENANCE MODE GATE ---
    if (maintenanceMode && user.user_type !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-school-cream-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center space-y-4">
            <div className="flex justify-center">
              <svg className="w-16 h-16 text-school-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">System Under Maintenance</h2>
            <p className="text-gray-500">ASASHS is currently undergoing scheduled maintenance. Please check back later.</p>
            <button onClick={signOut} className="px-6 py-2 bg-school-green-600 text-white rounded-xl font-bold hover:bg-school-green-700 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      );
    }

    let sidebarItems: any[] = [];
    let portalName: 'Admin' | 'Teacher' | 'Student' = 'Student';
    let content = null;

    if (user.user_type === 'admin') {
      portalName = 'Admin';
      sidebarItems = [
        { id: 'dashboard', label: 'Overview', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
        ...(user.user_id === 'ADMIN001' ? [{ id: 'subadmins', label: 'Sub-Admins', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> }] : []),
        { id: 'school_exams', label: 'School Exams', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { id: 'exam_reports', label: 'Exam Reports', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { id: 'students', label: 'Students', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
        { id: 'teachers', label: 'Teachers', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        { id: 'courses', label: 'Academics', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
        { id: 'timetables', label: 'Timetables', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { id: 'announcements', label: 'Announcements', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg> },
        { id: 'behavior', label: 'Behavior Records', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
        { id: 'performance', label: 'Performance', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
        { id: 'ai-settings', label: 'AI Settings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
        { id: 'voting', label: 'Elections', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { id: 'ict', label: 'ICT Registration', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
        { id: 'reports', label: 'Reports', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { id: 'system', label: 'System', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { id: 'profile', label: 'My Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> }
      ];

      switch (activeTab) {
        case 'dashboard': content = <AdminDashboard admin={user as any} onLogout={signOut} />; break;
        case 'subadmins': content = <AdminSubAdminManagement />; break;
        case 'school_exams': content = <AdminSchoolExams />; break;
        case 'exam_reports': content = <AdminExamReports />; break;
        case 'students': content = <AdminStudentManagement />; break;
        case 'teachers': content = <AdminTeacherManagement />; break;
        case 'courses': content = <CourseManagement />; break;
        case 'timetables': content = <AdminTimetableManagement />; break;
        case 'announcements': content = <AdminAnnouncements />; break;
        case 'behavior': content = <AdminBehaviorRecords />; break;
        case 'performance': content = <AdminStudentPerformance />; break;
        case 'ai-settings': content = <AdminAiSettings />; break;
        case 'voting': content = <AdminElectionManagement />; break;
        case 'ict': content = <ICTRegistrationPortal />; break;
        case 'system': content = <SystemOversight />; break;
        case 'reports': content = <AdminReports />; break;
        case 'profile': content = <AdminProfile adminId={user.user_id} />; break;
        default: content = <AdminDashboard admin={user as any} onLogout={signOut} />;
      }
    } else if (user.user_type === 'teacher') {
      portalName = 'Teacher';
      sidebarItems = [
        { id: 'dashboard', label: 'Overview', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { id: 'classes', label: 'My Classes', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        { id: 'assignments', label: 'Assignments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { id: 'exams', label: 'School Exams', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
        { id: 'grades', label: 'Gradebook', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg> },
        { id: 'performance', label: 'Performance', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
        { id: 'messages', label: 'Messages', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
        { id: 'elearning', label: 'E-Learning', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
        { id: 'profile', label: 'My Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> }
      ];

      // Map teacher props correctly
      const teacherProp = {
        fullName: user.full_name,
        teacherId: user.teacher_id,
        teacherDbId: user.teacher_db_id || user.id,
        department: (user as any).department || 'General',
        classes: (user as any).classes || [],
        subjects: (user as any).subjects || []
      };

      content = <TeacherDashboard teacher={teacherProp as any} onLogout={signOut} activeTab={activeTab} setActiveTab={setActiveTab} />;
    } else if (user.user_type === 'student') {
      portalName = 'Student';
      sidebarItems = [
        { id: 'overview', label: 'Overview', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { id: 'profile', label: 'My Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
        { id: 'grades', label: 'My Grades', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg> },
        { id: 'assignments', label: 'Assignments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { id: 'behavior', label: 'Behavior', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { id: 'downloads', label: 'Downloads', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> },
        { id: 'messages', label: 'Messages', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
        ...(hasActiveElection ? [{ id: 'voting', label: 'Vote Now', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }] : []),
        { id: 'exams', label: 'School Exams', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
        { id: 'elearning', label: 'E-Learning', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> }
      ];

      // Map student props correctly (use student_db_id not users.id)
      const studentProp = {
        fullName: user.full_name,
        studentId: user.student_id,
        id: (user.student_db_id || user.id).toString(),
        course: (user as any).course || 'General Arts',
        className: (user as any).class_name || '1A1',
        current_class_id: (user as any).current_class_id || 1,
        registration_status: (user as any).registration_status || 'complete'
      };

      content = <StudentDashboard student={studentProp as any} onLogout={signOut} activeTab={activeTab} setActiveTab={setActiveTab} />;
    }

    return (
      <PortalLayout
        portalName={portalName}
        userName={user.full_name}
        onLogout={signOut}
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        {content}
        <Toaster position="top-right" />
      </PortalLayout>
    );
  }

  // --- LOGGED OUT / LANDING VIEW ---
  const isAdminPath = window.location.pathname === '/admin_asashs';

  if (isAdminPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-cream-50 p-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-school-cream-200">
           <LoginForm onSubmit={(id, pass) => signIn(id, pass, 'admin')} />
           <button onClick={handleBackToLanding} className="mt-6 text-sm text-gray-500 hover:text-gray-700 w-full text-center">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {(showLandingPage || showNewsPage || showStaffPage || showCalendarPage) && (
        <LandingNavbar 
          onLoginClick={goToLogin} 
          onVoteClick={hasActiveElection ? goToLogin : undefined} 
          onNewsClick={() => { setShowNewsPage(true); setShowLandingPage(false); }}
          onStaffClick={() => { setShowStaffPage(true); setShowLandingPage(false); }}
          onCalendarClick={() => { setShowCalendarPage(true); setShowLandingPage(false); }}
          onHomeClick={handleBackToLanding}
        />
      )}
      
      <div className="relative flex-grow">
        {showNewsPage ? (
          <NewsEventsPage onHomeClick={handleBackToLanding} onLoginClick={goToLogin} onStaffClick={() => {}} onCalendarClick={() => {}} />
        ) : showStaffPage ? (
          <StaffDirectoryPage onHomeClick={handleBackToLanding} onLoginClick={goToLogin} onCalendarClick={() => {}} onNewsClick={() => {}} />
        ) : showCalendarPage ? (
          <AcademicCalendarPage onHomeClick={handleBackToLanding} onLoginClick={goToLogin} onStaffClick={() => {}} onNewsClick={() => {}} />
        ) : showLandingPage ? (
          <SchoolLandingPage onLoginClick={goToLogin} onVoteClick={hasActiveElection ? goToLogin : undefined} onNewsClick={() => {}} onStaffClick={() => {}} onCalendarClick={() => {}} onHomeClick={handleBackToLanding} />
        ) : (
          <UnifiedLogin onLogin={(id, pass) => signIn(id, pass, 'non-admin')} onHomeRedirect={handleBackToLanding} />
        )}
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

export default ComprehensivePortalApp;