import React, { useState, useEffect, useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import { SchoolLandingPage } from './pages/SchoolLandingPage';
import { NewsEventsPage } from './pages/NewsEventsPage';
import { StaffDirectoryPage } from './pages/StaffDirectoryPage';
import { AcademicCalendarPage } from './pages/AcademicCalendarPage';
import { LandingNavbar } from './components/LandingNavbar';
import { UnifiedLogin } from './pages/UnifiedLogin';

// Admin Portal Components
import { AuthContext } from '../AuthContext';
import LoginForm from '../LoginForm';
import { PasswordChangeModal } from './components/PasswordChangeModal';
import { SignOutModal } from './components/SignOutModal';
import { AdminStudentManagement } from './pages/admin/AdminStudentManagement';
import { AdminTeacherManagement } from './pages/admin/AdminTeacherManagement';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CourseManagement } from './pages/admin/CourseManagement';
import { AdminTimetableManagement } from './pages/admin/AdminTimetableManagement';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminBehaviorRecords } from './pages/admin/AdminBehaviorRecords';
import { AdminStudentPerformance } from './pages/admin/AdminStudentPerformance';
import { AdminProfile } from './pages/admin/AdminProfile';
import { AdminElectionManagement } from './pages/admin/AdminElectionManagement';
import { ICTRegistrationPortal } from './pages/admin/ICTRegistrationPortal';

// Student Portal Components
import { StudentDashboard } from './pages/student/StudentDashboard';

// Teacher Portal Components
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';

function AdminPortal({ user, signOut, changePassword }: { user: any, signOut: () => void, changePassword: (pwd: string) => Promise<void> }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const confirmSignOut = () => {
    signOut();
    setShowSignOutModal(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { id: 'students', label: 'Students', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { id: 'teachers', label: 'Teachers', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { id: 'courses', label: 'Academics', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    { id: 'timetables', label: 'Timetables', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { id: 'announcements', label: 'Announcements', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg> },
    { id: 'behavior', label: 'Behavior Records', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    { id: 'performance', label: 'Performance', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { id: 'voting', label: 'Elections', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'ict', label: 'ICT Registration', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    { id: 'reports', label: 'Reports', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: 'profile', label: 'My Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard admin={user} onLogout={signOut} />;
      case 'students': return <AdminStudentManagement />;
      case 'teachers': return <AdminTeacherManagement />;
      case 'courses': return <CourseManagement />;
      case 'timetables': return <AdminTimetableManagement />;
      case 'announcements': return <AdminAnnouncements />;
      case 'behavior': return <AdminBehaviorRecords />;
      case 'performance': return <AdminStudentPerformance />;
      case 'voting': return <AdminElectionManagement />;
      case 'ict': return <ICTRegistrationPortal />;
      case 'reports': return <AdminReports />;
      case 'profile': return <AdminProfile adminId={user.user_id} />;
      default: return <AdminDashboard admin={user} onLogout={signOut} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r hidden lg:flex flex-col">
        <div className="p-6 border-b flex items-center space-x-3 bg-school-green-600">
           <img src="/asashs-logo.png" alt="ASASHS Logo" className="w-10 h-10 rounded-lg bg-white p-1" />
           <span className="font-black text-white uppercase tracking-tighter">ASASHS ADMIN</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                ? 'bg-school-green-600 text-white'
                : 'text-gray-600 hover:bg-school-green-50'
                }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowSignOutModal(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              {activeTab.replace('_', ' ')}
            </h2>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-school-cream-100 px-3 py-1 rounded-full">
                <div className="bg-school-green-600 w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user.full_name}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={confirmSignOut}
        userName={user.full_name}
      />

      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onPasswordChanged={changePassword}
        userName={user.full_name}
      />
    </div>
  );
}

function ComprehensivePortalApp() {
  const { user, signIn, signOut, changePassword, loading } = useContext(AuthContext);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showNewsPage, setShowNewsPage] = useState(false);
  const [showStaffPage, setShowStaffPage] = useState(false);
  const [showCalendarPage, setShowCalendarPage] = useState(false);
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');

  useEffect(() => {
    // Check for hidden admin route
    if (window.location.pathname === '/admin_asashs') {
      setView('login');
      setShowLandingPage(false);
      return;
    }

    if (user) {
      setView('dashboard');
      setShowLandingPage(false);
    } else {
      setView('landing');
    }
  }, [user]);

  const goToLogin = () => {
    setShowLandingPage(false);
    setShowNewsPage(false);
    setShowStaffPage(false);
    setShowCalendarPage(false);
    setView('login');
  };

  const handleBackToLanding = () => {
    setShowLandingPage(true);
    setShowNewsPage(false);
    setShowStaffPage(false);
    setShowCalendarPage(false);
    setView('landing');
    if (window.location.pathname === '/admin_asashs') {
        window.history.pushState({}, '', '/');
    }
  };

  const isAdminPath = window.location.pathname === '/admin_asashs';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  // If user is logged in, show their respective dashboard
  if (user) {
    if (user.user_type === 'admin') return <AdminPortal user={user} signOut={signOut} changePassword={changePassword} />;
    if (user.user_type === 'teacher') return <TeacherDashboard teacher={user} onLogout={signOut} />;
    if (user.user_type === 'student') return <StudentDashboard student={user} onLogout={signOut} />;
  }

  // If on hidden admin path and not logged in
  if (isAdminPath && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-cream-50 p-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-school-cream-200">
           <LoginForm onSubmit={signIn} />
           <button onClick={handleBackToLanding} className="mt-6 text-sm text-gray-500 hover:text-gray-700 w-full text-center">Back to Home</button>
        </div>
      </div>
    );
  }

  // Otherwise, handle regular landing/login view
  return (
    <div className="min-h-screen">
      {(showLandingPage || showNewsPage || showStaffPage || showCalendarPage) && (
        <LandingNavbar 
          onLoginClick={goToLogin} 
          onVoteClick={goToLogin} 
          onNewsClick={() => { setShowNewsPage(true); setShowLandingPage(false); }}
          onStaffClick={() => { setShowStaffPage(true); setShowLandingPage(false); }}
          onCalendarClick={() => { setShowCalendarPage(true); setShowLandingPage(false); }}
          onHomeClick={handleBackToLanding}
        />
      )}
      
      <div className="relative">
        {showNewsPage ? (
          <NewsEventsPage onHomeClick={handleBackToLanding} onLoginClick={goToLogin} onStaffClick={() => {}} onCalendarClick={() => {}} />
        ) : showStaffPage ? (
          <StaffDirectoryPage onHomeClick={handleBackToLanding} onLoginClick={goToLogin} onCalendarClick={() => {}} onNewsClick={() => {}} />
        ) : showCalendarPage ? (
          <AcademicCalendarPage onHomeClick={handleBackToLanding} onLoginClick={goToLogin} onStaffClick={() => {}} onNewsClick={() => {}} />
        ) : showLandingPage ? (
          <SchoolLandingPage onLoginClick={goToLogin} onVoteClick={goToLogin} onNewsClick={() => {}} onStaffClick={() => {}} onCalendarClick={() => {}} onHomeClick={handleBackToLanding} />
        ) : (
          <UnifiedLogin onLogin={signIn} onHomeRedirect={handleBackToLanding} />
        )}
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

export default ComprehensivePortalApp;