import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { PortalInput } from './PortalInput';
import { PortalButton } from './PortalButton';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChanged: (newPassword: string) => Promise<void>;
  userName: string;
}

export function PasswordChangeModal({ isOpen, onClose, onPasswordChanged, userName }: PasswordChangeModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      setIsLoading(true);
      await onPasswordChanged(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error) {
      console.error('Password change failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-school-cream-200 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-school-green-100 to-school-green-200 rounded-full transform translate-x-16 -translate-y-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-school-cream-200 to-school-cream-300 rounded-full transform -translate-x-12 translate-y-12 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-school-green-100 to-school-green-200 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <span className="text-3xl">🔐</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Change Password</h2>
            <p className="text-gray-600 text-lg">Welcome, <span className="font-semibold text-school-green-700">{userName}</span>!</p>
            <div className="w-16 h-1 bg-gradient-to-r from-school-green-600 to-school-green-400 rounded-full mx-auto mt-4"></div>
            <p className="text-sm text-school-green-700 mt-4 bg-school-green-50 p-3 rounded-xl border border-school-green-200">
              🔒 You must change your password before continuing
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <PortalInput
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password (min 6 characters)"
              />
            </div>

            <div>
              <PortalInput
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </div>

            <div className="bg-gradient-to-r from-school-cream-50 to-school-green-50 p-5 rounded-2xl border border-school-cream-200">
              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                <span className="w-5 h-5 bg-school-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">!</span>
                Password Requirements
              </h4>
              <ul className="text-xs text-gray-600 space-y-2 ml-7">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-school-green-600 rounded-full mr-2"></span>
                  At least 6 characters long
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-school-green-600 rounded-full mr-2"></span>
                  Must be different from your temporary password
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-school-green-600 rounded-full mr-2"></span>
                  Use a combination of letters and numbers for security
                </li>
              </ul>
            </div>

            <PortalButton
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full justify-center"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Changing Password...
                </>
              ) : (
                <>
                  Change Password
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </PortalButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 bg-amber-50 p-3 rounded-xl border border-amber-200">
              ⚠️ This is required for first-time login. You cannot skip this step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}