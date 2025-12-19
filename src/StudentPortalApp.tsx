import React from 'react';
import { Toaster } from 'react-hot-toast';
import { StudentAuthProvider, useStudentAuth } from './contexts/StudentAuthContext';
import { StudentLogin } from './pages/student/StudentLogin';
import { StudentDashboard } from './pages/student/StudentDashboard';

function StudentPortalContent() {
  const { student, loading, login, logout } = useStudentAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading Student Portal...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return <StudentLogin onLogin={login} />;
  }

  return <StudentDashboard student={student} onLogout={logout} />;
}

function StudentPortalApp() {
  return (
    <StudentAuthProvider>
      <div className="min-h-screen">
        <StudentPortalContent />
        <Toaster position="top-right" />
      </div>
    </StudentAuthProvider>
  );
}

export default StudentPortalApp;