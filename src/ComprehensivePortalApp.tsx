import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { PortalSelection } from './PortalSelection';
import { SchoolLandingPage } from './pages/SchoolLandingPage';
import { NewsEventsPage } from './pages/NewsEventsPage';

// Admin Portal Components
import AuthProvider, { AuthContext } from '../AuthContext';
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

// Student Portal Components
import { StudentAuthProvider, useStudentAuth } from './contexts/StudentAuthContext';
import { StudentLogin } from './pages/student/StudentLogin';
import { StudentDashboard } from './pages/student/StudentDashboard';

// Teacher Portal Components
import { TeacherAuthProvider, useTeacherAuth } from './contexts/TeacherAuthContext';
import { TeacherLogin } from './pages/teacher/TeacherLogin';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';

function StudentPortalContent({ onBackToSelection }: { onBackToSelection: () => void }) {
  const { student, loading, login, logout } = useStudentAuth();
  const [showBackButton, setShowBackButton] = useState(true);

  // Hide back button when user is successfully logged in
  useEffect(() => {
    if (student) {
      setShowBackButton(false);
    } else {
      setShowBackButton(true);
    }
  }, [student]);

  const handleBackToSelection = () => {
    onBackToSelection();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-cream-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600 mx-auto"></div>
          <p className="mt-4 text-school-green-700 font-medium">Loading Student Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back to Portal Selection - Only show during login */}
      {showBackButton && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={handleBackToSelection}
            className="bg-white border border-school-cream-200 rounded-xl px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-school-cream-50 transition-all shadow-sm flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Portal Selection</span>
          </button>
        </div>
      )}

      {!student ? (
        <StudentLogin onLogin={login} />
      ) : (
        <StudentDashboard student={student} onLogout={logout} />
      )}
    </div>
  );
}

function TeacherPortalContent({ onBackToSelection }: { onBackToSelection: () => void }) {
  const { teacher, loading, login, logout } = useTeacherAuth();
  const [showBackButton, setShowBackButton] = useState(true);

  // Hide back button when user is successfully logged in
  useEffect(() => {
    if (teacher) {
      setShowBackButton(false);
    } else {
      setShowBackButton(true);
    }
  }, [teacher]);

  const handleBackToSelection = () => {
    onBackToSelection();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-cream-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600 mx-auto"></div>
          <p className="mt-4 text-school-green-700 font-medium">Loading Teacher Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back to Portal Selection - Only show during login */}
      {showBackButton && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={handleBackToSelection}
            className="bg-white border border-school-cream-200 rounded-xl px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-school-cream-50 transition-all shadow-sm flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Portal Selection</span>
          </button>
        </div>
      )}

      {!teacher ? (
        <TeacherLogin onLogin={login} />
      ) : (
        <TeacherDashboard teacher={teacher} onLogout={logout} />
      )}
    </div>
  );
}

function AdminPortal({ onBackToSelection }: { onBackToSelection: () => void }) {
  const { user, signIn, signOut, changePassword, loading } = React.useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showBackButton, setShowBackButton] = useState(true);

  // Hide back button when user is successfully logged in
  useEffect(() => {
    if (user && !user.must_change_password) {
      setShowBackButton(false);
    } else {
      setShowBackButton(true);
    }
  }, [user]);

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = () => {
    signOut();
    setShowSignOutModal(false);
  };

  const handleBackToSelection = () => {
    onBackToSelection();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600 mx-auto"></div>
          <p className="mt-4 text-school-green-700 font-medium">Loading ASASHS System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-cream-50 p-4">
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={handleBackToSelection}
            className="bg-white border border-school-cream-200 rounded-lg px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-school-cream-50 transition-all shadow-sm text-sm flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-sm border border-school-cream-200 p-8">
            <div className="text-center mb-8">
              <div className="mx-auto bg-school-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <img
                  src="/asashs-logo.png"
                  alt="ASASHS Logo"
                  className="w-12 h-12 rounded-lg"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
              <p className="text-gray-600 text-sm mt-2">Sign in to your account</p>
            </div>
            <div className="p-4">
              <LoginForm onSubmit={signIn} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user && user.must_change_password) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-school-cream-50 to-school-green-50">
        <PasswordChangeModal
          isOpen={true}
          onClose={() => { }}
          onPasswordChanged={changePassword}
          userName={user.full_name}
        />
      </div>
    );
  }

  const adminData = {
    id: user.id.toString(),
    adminId: user.user_id,
    fullName: user.full_name,
    role: 'Administrator'
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard admin={adminData} onLogout={handleSignOut} />;
      case 'students':
        return <AdminStudentManagement />;
      case 'teachers':
        return <AdminTeacherManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'timetables':
        return <AdminTimetableManagement />;
      case 'reports':
        return <AdminReports />;
      case 'announcements':
        return <AdminAnnouncements />;
      case 'behavior':
        return <AdminBehaviorRecords />;
      case 'performance':
        return <AdminStudentPerformance />;
      case 'profile':
        return <AdminProfile adminId={user.user_id} />;
      default:
        return <AdminDashboard admin={adminData} onLogout={handleSignOut} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Back to Portal Selection - Only show during login */}
      {showBackButton && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={handleBackToSelection}
            className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white transition-all shadow-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Portal Selection</span>
          </button>
        </div>
      )}

      {/* Simplified Sidebar */}
      <div className="w-64 bg-white shadow-xl flex flex-col">
        <div className="p-6 bg-gradient-to-r from-school-green-600 to-school-green-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-white p-1 rounded-lg">
              <img
                src="/asashs-logo.png"
                alt="ASASHS Logo"
                className="w-10 h-10 rounded-md"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ASASHS Admin</h1>
              <p className="text-xs text-school-green-200">Akim Asafo SHS</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          {[
            {
              id: 'dashboard', label: 'Dashboard', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              )
            },
            {
              id: 'students', label: 'Students', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )
            },
            {
              id: 'teachers', label: 'Teachers', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )
            },
            {
              id: 'courses', label: 'Courses', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              )
            },
            {
              id: 'timetables', label: 'Timetables', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )
            },
            {
              id: 'performance', label: 'Student Performance', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )
            },
            {
              id: 'announcements', label: 'Announcements', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              )
            },
            {
              id: 'behavior', label: 'Behavior Records', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )
            },
            {
              id: 'reports', label: 'Reports', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )
            },
            {
              id: 'profile', label: 'My Profile', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )
            }
          ].map((item) => (
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
              {activeTab === 'dashboard' ? 'Dashboard Overview' :
                activeTab === 'students' ? 'Student Management' :
                  activeTab === 'teachers' ? 'Teacher Management' :
                    activeTab === 'courses' ? 'Course & Academic Management' :
                      activeTab === 'timetables' ? 'Timetable Management' :
                        activeTab === 'performance' ? 'Student Performance Analytics' :
                          activeTab === 'announcements' ? 'Announcements Management' :
                            activeTab === 'behavior' ? 'Behavior Records' : 'Reports & Analytics'}
            </h2>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-school-cream-100 px-3 py-1 rounded-full">
                <div className="bg-school-green-600 w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.full_name.charAt(0)}
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
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showNewsPage, setShowNewsPage] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<'admin' | 'student' | 'teacher' | null>(null);

  useEffect(() => {
    // Check for saved portal selection
    const savedPortal = localStorage.getItem('selectedPortal');
    if (savedPortal && (savedPortal === 'admin' || savedPortal === 'student' || savedPortal === 'teacher')) {
      setSelectedPortal(savedPortal);
      setShowLandingPage(false);
    }
  }, []);

  const handlePortalSelection = (portal: 'admin' | 'student' | 'teacher') => {
    setSelectedPortal(portal);
    setShowLandingPage(false);
    localStorage.setItem('selectedPortal', portal);
  };

  const handleBackToSelection = () => {
    setSelectedPortal(null);
    localStorage.removeItem('selectedPortal');
  };

  const handleBackToLanding = () => {
    setSelectedPortal(null);
    setShowLandingPage(true);
    localStorage.removeItem('selectedPortal');
  };

  const goToPortalSelection = () => {
    setShowLandingPage(false);
    setShowNewsPage(false);
  };

  const goToNewsPage = () => {
    setShowLandingPage(false);
    setShowNewsPage(true);
    setSelectedPortal(null);
  };

  const handleBackFromNews = () => {
    setShowNewsPage(false);
    setShowLandingPage(true);
  };

  // Wrapper components that pass the back function down
  const AdminPortalWrapper = () => (
    <AuthProvider>
      <AdminPortal onBackToSelection={handleBackToSelection} />
    </AuthProvider>
  );

  const StudentPortalWrapper = () => (
    <StudentAuthProvider>
      <StudentPortalContent onBackToSelection={handleBackToSelection} />
    </StudentAuthProvider>
  );

  const TeacherPortalWrapper = () => (
    <TeacherAuthProvider>
      <TeacherPortalContent onBackToSelection={handleBackToSelection} />
    </TeacherAuthProvider>
  );

  return (
    <div className="min-h-screen">
      {/* Main wrapper for logic */}
      <div className="relative min-h-screen">
        {showNewsPage ? (
          <NewsEventsPage onLoginClick={goToPortalSelection} />
        ) : showLandingPage ? (
          <SchoolLandingPage onLoginClick={goToPortalSelection} onNewsClick={goToNewsPage} />
        ) : !selectedPortal ? (
          <PortalSelection onSelectPortal={handlePortalSelection} onBackToHome={handleBackToLanding} />
        ) : (
          <>
            {selectedPortal === 'admin' && <AdminPortalWrapper />}
            {selectedPortal === 'student' && <StudentPortalWrapper />}
            {selectedPortal === 'teacher' && <TeacherPortalWrapper />}
          </>
        )}
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

export default ComprehensivePortalApp;