import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { PortalButton } from '../components/PortalButton';
import { PortalCard } from '../components/PortalCard';
import { PortalInput } from '../components/PortalInput';
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
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans select-none">
      {/* Header Bar */}
      <header className="relative z-10 p-6 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={onHomeRedirect}
          >
            <div className="bg-school-green-800 p-2 rounded-sm border border-school-green-700">
              <img src="/asashs-logo.png" alt="ASASHS Logo" className="w-8 h-8 rounded-sm object-contain" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 tracking-tight leading-tight">AKIM ASAFO SHS</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                {Capacitor.isNativePlatform() ? 'Student Android Portal' : 'Digital Campus'}
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-400 hidden sm:inline-block font-mono">
            {getGreeting()}
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <PortalCard className="p-8 sm:p-10 space-y-6">
            <div className="text-center space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-sm text-[11px] font-semibold bg-school-green-50 text-school-green-800 border border-school-green-200 uppercase tracking-wider">
                {Capacitor.isNativePlatform() ? 'Student Examination Portal' : 'Official Portal Login'}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {Capacitor.isNativePlatform() ? 'Student Sign In' : 'Sign in to Your Account'}
              </h2>
              <p className="text-xs text-gray-500">
                {Capacitor.isNativePlatform() 
                  ? 'Enter your Student ID or Admission Number'
                  : 'Enter your official student or staff credentials'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <PortalInput
                id="login-user-id"
                label={Capacitor.isNativePlatform() ? 'Student ID / Admission Number' : 'User ID / Staff ID'}
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={Capacitor.isNativePlatform() ? "e.g. STU2026001 or ASA2026001" : "Enter official ID"}
                required
                autoComplete="username"
              />

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="login-password" className="block text-xs font-semibold text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-school-green-700 hover:text-school-green-800 font-semibold focus-visible:outline-none"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 transition"
                />
              </div>

              <div className="pt-2">
                <PortalButton
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  loadingText="Verifying credentials..."
                  className="w-full"
                >
                  {Capacitor.isNativePlatform() ? 'Access Student Portal' : 'Sign In'}
                </PortalButton>
              </div>
            </form>

            <div className="pt-4 border-t border-gray-100">
              <div className="bg-gray-50 rounded-sm p-3.5 border border-gray-200 text-left flex items-start gap-3">
                <div className="w-5 h-5 rounded-sm bg-school-green-100 text-school-green-800 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  i
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 leading-tight">
                    {Capacitor.isNativePlatform() ? 'Student Dedicated Application' : 'Institutional Security Policy'}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                    {Capacitor.isNativePlatform()
                      ? 'This Android application is restricted to ASASHS students for secure exams and offline sync.'
                      : 'Students taking supervised examinations must use the official ASASHS Android APK.'}
                  </p>
                </div>
              </div>
            </div>
          </PortalCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center bg-white border-t border-gray-200">
        <p className="text-gray-400 text-xs tabular-nums">
          &copy; 2026 Akim Asafo Senior High School &bull; All Rights Reserved
        </p>
      </footer>
    </div>
  );
};
