import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { PortalButton } from '../components/PortalButton';
import { Capacitor } from '@capacitor/core';

interface UnifiedLoginProps {
  onLogin: (userId: string, password: string) => Promise<void>;
  onHomeRedirect?: () => void;
  onTesterSignup?: () => void;
}

export const UnifiedLogin: React.FC<UnifiedLoginProps> = ({ onLogin, onHomeRedirect }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning, Scholar';
    if (hour < 17) return 'Good Afternoon, Scholar';
    return 'Good Evening, Scholar';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId.trim() || !password.trim()) {
      toast.error('Please enter both your ID and password');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(userId.trim(), password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col font-sans select-none">
      {/* Subtle Animated Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-school-green-100/50 blur-[140px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-100/40 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header Bar */}
      <header className="relative z-10 p-6 md:p-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={onHomeRedirect}>
            <div className="bg-gradient-to-br from-school-green-600 to-school-green-800 p-2.5 rounded-2xl shadow-lg ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-300">
              <img src="/asashs-logo.png" alt="ASASHS Logo" className="w-10 h-10 rounded-xl object-contain shadow-sm" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">ASASHS</h1>
              <p className="text-[10px] text-school-green-600 uppercase tracking-[0.2em] font-extrabold italic">
                {Capacitor.isNativePlatform() ? 'Student Android Portal' : 'Digital Campus'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 ease-out">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(15,62,47,0.12)] border border-white p-8 sm:p-10 relative overflow-hidden transition-all duration-300 hover:shadow-[0_30px_70px_-15px_rgba(15,62,47,0.18)]">
            {/* Top Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-school-green-600 via-amber-500 to-blue-600 animate-pulse"></div>

            <div className="text-center mb-8">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-school-green-50 to-amber-50 text-school-green-800 border border-school-green-200/60 mb-3 shadow-sm">
                {Capacitor.isNativePlatform() ? '🎓 Student Examination Portal' : `🏛️ ${getGreeting()}`}
              </span>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2 uppercase bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-school-green-950 to-gray-800">
                {Capacitor.isNativePlatform() ? 'Student Login' : 'Welcome Back'}
              </h2>
              <p className="text-gray-500 font-medium text-xs tracking-wide">
                {Capacitor.isNativePlatform() 
                  ? 'Sign in with your Student ID or Admission Number'
                  : 'Please sign in with your student or staff ID'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 px-1">
                  {Capacitor.isNativePlatform() ? 'Student ID / Admission Number' : 'User ID / Staff ID'}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-school-green-600 group-focus-within:scale-110 transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder={Capacitor.isNativePlatform() ? "e.g. STU2026001 or ASA2026001" : "Enter your official ID"}
                    required
                    className="w-full pl-11 pr-4 py-4 bg-gray-50/80 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-school-green-600 focus:ring-4 focus:ring-school-green-600/10 focus:outline-none transition-all duration-300 font-bold text-gray-900 placeholder-gray-400 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Secret Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] font-black text-school-green-600 hover:text-school-green-700 uppercase tracking-widest transition-transform active:scale-95"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-school-green-600 group-focus-within:scale-110 transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-4 py-4 bg-gray-50/80 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-school-green-600 focus:ring-4 focus:ring-school-green-600/10 focus:outline-none transition-all duration-300 font-bold text-gray-900 shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-2">
                <PortalButton
                  type="submit"
                  disabled={isLoading}
                  className="w-full justify-center py-5 rounded-2xl bg-gradient-to-r from-school-green-600 via-school-green-700 to-emerald-800 hover:from-school-green-700 hover:to-emerald-900 text-white font-black uppercase tracking-widest shadow-xl shadow-school-green-600/25 ring-2 ring-white/20 transition-all duration-300 hover:-translate-y-1 active:scale-95 relative overflow-hidden group"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {Capacitor.isNativePlatform() ? 'Access Student Portal' : 'Grant Access'}
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </span>
                  )}
                </PortalButton>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 space-y-2.5">
              <div className="bg-school-green-50 rounded-xl p-3 border border-school-green-200 text-left flex items-start gap-3">
                <span className="text-lg mt-0.5">{Capacitor.isNativePlatform() ? '🎓' : '📱'}</span>
                <div>
                  <p className="text-xs font-bold text-school-green-900 leading-snug">
                    {Capacitor.isNativePlatform() ? 'Student-Only Android Portal' : 'Student APK Policy Enforced'}
                  </p>
                  <p className="text-[11px] text-gray-600 leading-tight mt-0.5">
                    {Capacitor.isNativePlatform()
                      ? 'This Android app is designed strictly and exclusively for ASASHS Students. Staff & Administrators must access via the Web Portal.'
                      : 'For examination security and offline synchronization, Students must access via the official ASASHS Android APK.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center bg-white/60 backdrop-blur-sm border-t border-gray-100">
        <p className="text-gray-400 text-[10px] uppercase tracking-[0.4em] font-black">
          &copy; 2025 Akim Asafo Senior High School &bull; Digital Campus
        </p>
      </footer>
    </div>
  );
};
