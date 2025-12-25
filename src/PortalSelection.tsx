import React from 'react';

interface PortalSelectionProps {
  onSelectPortal: (portal: 'admin' | 'student' | 'teacher') => void;
  onBackToHome?: () => void;
}

export const PortalSelection: React.FC<PortalSelectionProps> = ({ onSelectPortal, onBackToHome }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-school-cream-50 via-white to-school-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-school-cream-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="mr-2 text-gray-500 hover:text-school-green-600 transition-colors"
                  title="Back to Website"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              <div className="bg-school-green-600 p-2 rounded-xl shadow-lg">
                <img
                  src="/asashs-logo.png"
                  alt="ASASHS Logo"
                  className="w-12 h-12 rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ASASHS</h1>
                <p className="text-sm text-gray-600">Akim Asafo Senior High School</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Comprehensive Student Management System</p>
              <p className="text-xs text-gray-400">Version 2.0</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section with Prominent Logo */}
        <div className="text-center mb-16 mt-8">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-school-green-500 to-school-green-700 p-6 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <img
                src="/asashs-logo.png"
                alt="ASASHS Logo"
                className="w-32 h-32 rounded-2xl shadow-lg"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-school-green-600">ASASHS</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Access your personalized dashboard to manage academics, track progress, and stay connected
            with the school community.
          </p>
        </div>

        {/* Portal Selection Grid - Professional Modern Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Admin Portal Card */}
          <div
            onClick={() => onSelectPortal('admin')}
            className="bg-white rounded-2xl shadow-lg border border-school-cream-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-2"
          >
            <div className="h-40 bg-gradient-to-r from-red-500 to-red-600 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-4 left-6">
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  System Administration
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  Staff Only
                </span>
              </div>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                System administration and comprehensive oversight tools for managing students,
                teachers, courses, and school operations.
              </p>
              <button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl transition-all text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]">
                Access Admin Portal
              </button>
            </div>
          </div>

          {/* Student Portal Card */}
          <div
            onClick={() => onSelectPortal('student')}
            className="bg-white rounded-2xl shadow-lg border border-school-cream-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-2"
          >
            <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-600 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-4 left-6">
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Student Services
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-gray-900">Student Portal</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  For Students
                </span>
              </div>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Access your academic information, grades, assignments, and school resources.
                Stay connected with your classes and teachers.
              </p>
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl transition-all text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]">
                Access Student Portal
              </button>
            </div>
          </div>

          {/* Teacher Portal Card */}
          <div
            onClick={() => onSelectPortal('teacher')}
            className="bg-white rounded-2xl shadow-lg border border-school-cream-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-2"
          >
            <div className="h-40 bg-gradient-to-r from-school-green-500 to-school-green-600 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-4 left-6">
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Teaching Tools
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-gray-900">Teacher Portal</h2>
                <span className="bg-school-green-100 text-school-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  For Teachers
                </span>
              </div>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Manage your classes, grades, student assessments, and teaching materials.
                Communicate with students and track their progress.
              </p>
              <button className="w-full bg-gradient-to-r from-school-green-500 to-school-green-600 hover:from-school-green-600 hover:to-school-green-700 text-white py-3 px-4 rounded-xl transition-all text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]">
                Access Teacher Portal
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-school-cream-200 p-6 text-center hover:shadow-md transition-shadow hover:border-school-green-300">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Comprehensive Management</h3>
            <p className="text-gray-600 text-sm mt-1">All school operations in one place</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-school-cream-200 p-6 text-center hover:shadow-md transition-shadow hover:border-school-green-300">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Secure & Reliable</h3>
            <p className="text-gray-600 text-sm mt-1">Enterprise-grade security for your data</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-school-cream-200 p-6 text-center hover:shadow-md transition-shadow hover:border-school-green-300">
            <div className="w-16 h-16 bg-school-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-school-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Fast & Efficient</h3>
            <p className="text-gray-600 text-sm mt-1">Optimized for speed and performance</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-school-cream-200 text-center">
          <p className="text-gray-600 text-sm">
            &copy; 2025 Akim Asafo Senior High School. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Comprehensive Student Management System v2.0
          </p>
        </div>
      </main>
    </div>
  );
};