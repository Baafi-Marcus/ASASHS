import React from 'react';

interface PortalSelectionProps {
  onSelectPortal: (portal: 'admin' | 'student' | 'teacher') => void;
  onBackToHome?: () => void;
}

export const PortalSelection: React.FC<PortalSelectionProps> = ({ onSelectPortal, onBackToHome }) => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col font-sans">
      {/* Dynamic Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-school-green-100/40 blur-[130px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/40 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-100 backdrop-blur-md bg-white/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all group border border-transparent hover:border-gray-200"
                  title="Back to Website"
                >
                  <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-school-green-600 to-school-green-800 p-2 rounded-xl shadow-lg ring-1 ring-white/20">
                  <img
                    src="/asashs-logo.png"
                    alt="ASASHS Logo"
                    className="w-10 h-10 rounded-lg"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">ASASHS</h1>
                  <p className="text-[10px] text-school-green-600 uppercase tracking-[0.2em] font-bold">Portal Gateway</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest italic">Official Access Only</p>
              <div className="flex items-center justify-end space-x-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                <span className="text-[10px] font-black text-green-600 uppercase tracking-tighter">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-6 py-12">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-6">
              Official Portal <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-school-green-600 to-blue-600">
                Identity Selection
              </span>
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto font-medium leading-relaxed">
              Please choose your official role to access the specialized management and learning tools designed for you.
            </p>
            <div className="h-2 w-32 bg-gradient-to-r from-school-green-600 to-blue-600 mx-auto mt-8 rounded-full shadow-sm"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {/* Student Portal Card */}
            <div
              onClick={() => onSelectPortal('student')}
              className="group relative cursor-pointer"
            >
              {/* Animated Glow Effect */}
              <div className="absolute inset-0 bg-school-green-200/40 blur-3xl group-hover:bg-school-green-400/30 transition-all duration-700 rounded-[3rem] opacity-0 group-hover:opacity-100 -z-10"></div>
              
              <div className="relative bg-white border-2 border-gray-100 p-10 rounded-[3rem] hover:border-school-green-500 transition-all duration-500 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.04)] group-hover:shadow-[0_25px_60px_rgba(34,197,94,0.15)] group-hover:-translate-y-2">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
                  <svg className="w-48 h-48 text-school-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L1 7l11 5 11-5-11-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>

                <div className="relative z-10 h-full flex flex-col">
                  <div className="w-20 h-20 bg-school-green-50 rounded-3xl flex items-center justify-center mb-8 ring-2 ring-school-green-100 group-hover:bg-school-green-500 group-hover:text-white transition-all duration-500 shadow-sm">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  
                  <span className="text-xs font-black text-school-green-600 uppercase tracking-[0.4em] mb-2">Student Access</span>
                  <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">STUDENT</h3>
                  <p className="text-gray-500 font-medium leading-relaxed mb-10">
                    Access your personalized learning dashboard, view terminal results, attendance records, and participate in voting.
                  </p>
                  
                  <div className="mt-auto flex items-center text-school-green-600 font-black text-sm uppercase tracking-widest group-hover:translate-x-3 transition-transform duration-500">
                    <span>Enter Student Portal</span>
                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
              {/* Animated Glow Effect */}
              <div className="absolute inset-0 bg-blue-200/40 blur-3xl group-hover:bg-blue-400/30 transition-all duration-700 rounded-[3rem] opacity-0 group-hover:opacity-100 -z-10"></div>
              
              <div className="relative bg-white border-2 border-gray-100 p-10 rounded-[3rem] hover:border-blue-500 transition-all duration-500 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.04)] group-hover:shadow-[0_25px_60px_rgba(59,130,246,0.15)] group-hover:-translate-y-2">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
                  <svg className="w-48 h-48 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                <div className="relative z-10 h-full flex flex-col">
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 ring-2 ring-blue-100 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-sm">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                  
                  <span className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] mb-2">Academic Staff</span>
                  <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">TEACHER</h3>
                  <p className="text-gray-500 font-medium leading-relaxed mb-10">
                    Manage class assignments, upload student performance data, track behavioral records, and coordinate with staff.
                  </p>
                  
                  <div className="mt-auto flex items-center text-blue-600 font-black text-sm uppercase tracking-widest group-hover:translate-x-3 transition-transform duration-500">
                    <span>Enter Staff Portal</span>
                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center border-t border-gray-100 bg-white">
        <p className="text-gray-400 text-[11px] uppercase tracking-[0.5em] font-black mb-3">
          &copy; 2025 Akim Asafo Senior High School
        </p>
        <p className="text-gray-300 text-[10px] font-bold tracking-tighter">
          SECURE SCHOOL MANAGEMENT ARCHITECTURE • IDENTITY VERSION 4.2
        </p>
      </footer>
    </div>
  );
};