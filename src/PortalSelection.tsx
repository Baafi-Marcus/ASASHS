import React from 'react';

interface PortalSelectionProps {
  onSelectPortal: (portal: 'admin' | 'student' | 'teacher') => void;
  onBackToHome?: () => void;
}

export const PortalSelection: React.FC<PortalSelectionProps> = ({ onSelectPortal, onBackToHome }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans select-none">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="p-2 rounded-sm border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                  title="Back to Website"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              <div className="flex items-center space-x-3">
                <div className="bg-school-green-800 p-1.5 rounded-sm border border-school-green-700">
                  <img
                    src="/asashs-logo.png"
                    alt="ASASHS Logo"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900 tracking-tight leading-none">ASASHS</h1>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Portal Gateway</p>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-600 rounded-sm"></span>
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6 py-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-2 py-1 px-2.5 rounded-sm bg-school-green-50 border border-school-green-200 text-[10px] uppercase font-bold text-school-green-800 mb-3">
              <span>Authentication Gateway</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
              Select Your Access Portal
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Please select your designated institutional role to access course records, grading, and portal tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Student Portal Card */}
            <div
              onClick={() => onSelectPortal('student')}
              className="bg-white rounded-md border border-gray-200 p-8 hover:border-school-green-600 transition-colors cursor-pointer shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-sm bg-school-green-50 border border-school-green-200 text-school-green-800 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                
                <span className="text-[10px] font-bold text-school-green-700 uppercase tracking-widest mb-1 block">Student Access</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Student Portal</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-8">
                  Access course resources, continuous assessments, terminal grades, exam schedules, and institutional voting.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-school-green-700">
                <span>Enter Student Portal</span>
                <span className="text-sm">→</span>
              </div>
            </div>

            {/* Teacher Portal Card */}
            <div
              onClick={() => onSelectPortal('teacher')}
              className="bg-white rounded-md border border-gray-200 p-8 hover:border-school-green-600 transition-colors cursor-pointer shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-sm bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
                
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1 block">Academic Staff</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Teacher Portal</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-8">
                  Manage assigned subject classes, enter CA and exam marks into the official gradebook, and conduct online quizzes.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-700">
                <span>Enter Teacher Portal</span>
                <span className="text-sm">→</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-gray-200 bg-white text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Akim Asafo Senior High School. All rights reserved.</p>
      </footer>
    </div>
  );
};