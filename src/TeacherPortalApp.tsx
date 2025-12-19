import React from 'react';
import { Toaster } from 'react-hot-toast';
import { TeacherAuthProvider, useTeacherAuth } from './contexts/TeacherAuthContext';
import { TeacherLogin } from './pages/teacher/TeacherLogin';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';

function TeacherPortalContent() {
  const { teacher, loading, login, logout } = useTeacherAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto"></div>
          <p className="mt-4 text-green-700 font-medium">Loading Teacher Portal...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return <TeacherLogin onLogin={login} />;
  }

  return <TeacherDashboard teacher={teacher} onLogout={logout} />;
}

function TeacherPortalApp() {
  return (
    <TeacherAuthProvider>
      <div className="min-h-screen">
        <TeacherPortalContent />
        <Toaster position="top-right" />
      </div>
    </TeacherAuthProvider>
  );
}

export default TeacherPortalApp;