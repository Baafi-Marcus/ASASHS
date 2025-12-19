import React from 'react';
import { PortalButton } from './PortalButton';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

export function SignOutModal({ isOpen, onClose, onConfirm, userName }: SignOutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-school-cream-200 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-full transform translate-x-16 -translate-y-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-school-cream-200 to-school-cream-300 rounded-full transform -translate-x-12 translate-y-12 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-red-100 to-red-200 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <span className="text-3xl">🚪</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Sign Out</h2>
            <p className="text-gray-600 text-lg">
              Are you sure you want to sign out, <span className="font-semibold text-school-green-700">{userName}</span>?
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full mx-auto mt-4"></div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">⚠</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-800 mb-1">Before you go</h4>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Make sure you've saved any pending changes</li>
                  <li>• All unsaved work will be lost</li>
                  <li>• You'll need to log in again to access the system</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <PortalButton
              variant="secondary"
              onClick={onClose}
              className="flex-1 justify-center"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </PortalButton>
            
            <PortalButton
              variant="danger"
              onClick={onConfirm}
              className="flex-1 justify-center"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </PortalButton>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              You can always sign back in with your credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}