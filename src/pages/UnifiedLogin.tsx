import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { PortalInput } from '../components/PortalInput';
import { PortalButton } from '../components/PortalButton';

interface UnifiedLoginProps {
  onLogin: (userId: string, password: string) => Promise<void>;
  onHomeRedirect?: () => void;
  onTesterSignup?: () => void;
}

export const UnifiedLogin: React.FC<UnifiedLoginProps> = ({ onLogin, onHomeRedirect, onTesterSignup }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      // toast is usually handled by the AuthContext, but we catch here just in case
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col font-sans">
      {/* Dynamic Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-school-green-100/40 blur-[130px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/40 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header/Logo */}
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onHomeRedirect}>
            <div className="bg-gradient-to-br from-school-green-600 to-school-green-800 p-2 rounded-xl shadow-lg ring-1 ring-white/20">
              <img src="/asashs-logo.png" alt="ASASHS Logo" className="w-10 h-10 rounded-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">ASASHS</h1>
              <p className="text-[10px] text-school-green-600 uppercase tracking-[0.2em] font-bold italic">Digital Campus</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Login Card */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white p-10 relative overflow-hidden">
            {/* Top Bar Decoration */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-school-green-600 to-blue-600"></div>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-3 uppercase">Welcome Back</h2>
              <p className="text-gray-500 font-medium">Please sign in with your official ID</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">User ID / Staff ID</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-school-green-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter your ID"
                    required
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-school-green-500 focus:outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Secret Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] font-black text-school-green-600 hover:text-school-green-700 uppercase tracking-widest"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-school-green-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-school-green-500 focus:outline-none transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              <div className="pt-2">
                <PortalButton
                  type="submit"
                  disabled={isLoading}
                  className="w-full justify-center py-5 rounded-2xl bg-gradient-to-r from-school-green-600 to-school-green-700 hover:from-school-green-700 hover:to-school-green-800 text-white font-black uppercase tracking-widest shadow-xl shadow-school-green-200 ring-2 ring-white/20 transition-all hover:-translate-y-1 active:scale-95"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Grant Access'
                  )}
                </PortalButton>
              </div>
            </form>


            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Security Policy: Official School Access Only
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="relative z-10 py-8 text-center bg-white/50 backdrop-blur-sm">
        <p className="text-gray-400 text-[10px] uppercase tracking-[0.5em] font-black">
          &copy; 2025 Akim Asafo Senior High School
        </p>
      </footer>
    </div>
  );
};
