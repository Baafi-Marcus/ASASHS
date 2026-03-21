import React from 'react';

interface PortalSelectionProps {
  onSelectPortal: (portal: 'admin' | 'student' | 'teacher') => void;
  onBackToHome?: () => void;
}

export const PortalSelection: React.FC<PortalSelectionProps> = ({ onSelectPortal, onBackToHome }) => {
  return (
    <div className="min-h-screen bg-[#0a0f1a] relative overflow-hidden flex flex-col font-sans">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-school-green-600/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all group"
                  title="Back to Website"
                >
                  <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-school-green-500 to-school-green-700 p-2 rounded-xl shadow-lg ring-1 ring-white/20">
                  <img
                    src="/asashs-logo.png"
                    alt="ASASHS Logo"
                    className="w-10 h-10 rounded-lg"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">ASASHS</h1>
                  <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-semibold">Senior High School</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-white/70">Secure Portal Access</p>
              <div className="flex items-center justify-end space-x-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">System Online</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          {/* Welcome Text */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
              Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-school-green-400 to-blue-400">Portal</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
              Experience the future of school management. A fast, secure, and beautiful interface designed for clarity and productivity.
            </p>
          </div>

          {/* Portal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Portal Card */}
            <div
              onClick={() => onSelectPortal('student')}
              className="group relative cursor-pointer"
            >
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl group-hover:bg-blue-500/30 transition-all duration-500 rounded-3xl opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-blue-500/50 transition-all duration-500 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-32 h-32 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">Student</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-8">
                    Access your personalized learning dashboard, view grades, and stay on top of assignments.
                  </p>
                  <div className="flex items-center text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
                    <span>Enter Portal</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Portal Card */}
            <div
              onClick={() => onSelectPortal('teacher')}
              className="group relative cursor-pointer"
            >
              <div className="absolute inset-0 bg-school-green-500/20 blur-2xl group-hover:bg-school-green-500/30 transition-all duration-500 rounded-3xl opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-school-green-500/50 transition-all duration-500 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-32 h-32 text-school-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-school-green-500/20 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-school-green-500/30 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-8 h-8 text-school-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">Teacher</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-8">
                    Manage your classes, grade assignments, and track student performance with precision tools.
                  </p>
                  <div className="flex items-center text-school-green-400 font-bold group-hover:translate-x-2 transition-transform">
                    <span>Enter Portal</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center border-t border-white/5 bg-black/40">
        <p className="text-white/30 text-[11px] uppercase tracking-[0.3em] font-medium mb-2">
          &copy; 2025 Akim Asafo Senior High School
        </p>
        <p className="text-white/20 text-[10px] font-semibold">
          COMPREHENSIVE STUDENT MANAGEMENT SYSTEM 3.0 • PRO EDITION
        </p>
      </footer>
    </div>
  );
};