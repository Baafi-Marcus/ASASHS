import React, { useState } from 'react';
import { UserAvatar } from './UserAvatar';

interface PortalHeaderProps {
  portalName: string;
  userName: string;
  onLogout: () => void;
  onBackToSelection?: () => void;
  isTestAccount?: boolean;
  currentRole?: 'admin' | 'teacher' | 'student';
  onRoleChange?: (role: 'admin' | 'teacher' | 'student') => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({ 
  portalName, 
  userName, 
  onLogout,
  onBackToSelection,
  isTestAccount,
  currentRole,
  onRoleChange
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    teacher: 'Teacher',
    student: 'Student'
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Left Brand Area */}
          <div className="flex items-center space-x-3">
            {onBackToSelection && (
              <button
                onClick={onBackToSelection}
                aria-label="Back to Portal Selection"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm hover:bg-gray-100 text-gray-600 transition-colors focus-visible:ring-2 focus-visible:ring-school-green-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-sm bg-school-green-700 text-white flex items-center justify-center font-bold text-xs tracking-wider">
                {portalName.slice(0, 3).toUpperCase()}
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-semibold text-gray-900 tracking-tight">
                  ASASHS {portalName} Portal
                </h1>
                <p className="text-[11px] text-gray-500 hidden sm:block">Akim Asafo Senior High School</p>
              </div>
            </div>
          </div>
          
          {/* Right User Area */}
          <div className="flex items-center space-x-3">
            {isTestAccount && onRoleChange && (
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  aria-label="Switch User Role"
                  className="min-h-[40px] flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-sm text-xs font-semibold hover:bg-amber-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Role: {roleLabels[currentRole || 'admin']}</span>
                </button>
                {showRoleMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowRoleMenu(false)} />
                    <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                      {(['admin', 'teacher', 'student'] as const).map((role) => (
                        <button
                          key={role}
                          onClick={() => { onRoleChange(role); setShowRoleMenu(false); }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${
                            currentRole === role ? 'text-school-green-700 bg-gray-50 font-semibold' : 'text-gray-700'
                          }`}
                        >
                          {roleLabels[role]} Portal
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2.5">
              <UserAvatar name={userName} size="sm" status="online" />
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-900 leading-tight">{userName}</p>
                <p className="text-[11px] text-gray-500">{portalName}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              aria-label="Sign Out"
              className="min-h-[44px] px-2.5 py-1.5 flex items-center space-x-1.5 text-gray-600 hover:text-red-700 rounded-sm hover:bg-gray-100 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-school-green-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};