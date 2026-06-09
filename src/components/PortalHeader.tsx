import React, { useState } from 'react';

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
    <header className="bg-white border-b border-school-cream-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {onBackToSelection && (
              <button
                onClick={onBackToSelection}
                className="mr-4 p-2 rounded-lg hover:bg-school-cream-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                portalName === 'Admin' ? 'bg-red-500' : 
                portalName === 'Student' ? 'bg-blue-500' : 
                'bg-school-green-500'
              }`}>
                <span className="text-white font-bold text-lg">
                  {portalName.charAt(0)}
                </span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">ASASHS {portalName} Portal</h1>
                <p className="text-xs text-gray-500">Akim Asafo Senior High School</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isTestAccount && onRoleChange && (
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-semibold hover:bg-amber-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>View: {roleLabels[currentRole || 'admin']}</span>
                </button>
                {showRoleMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowRoleMenu(false)} />
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20">
                      {(['admin', 'teacher', 'student'] as const).map((role) => (
                        <button
                          key={role}
                          onClick={() => { onRoleChange(role); setShowRoleMenu(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-school-cream-50 transition-colors ${
                            currentRole === role ? 'text-school-green-600 bg-school-cream-50' : 'text-gray-700'
                          }`}
                        >
                          {role === 'admin' ? '🛠️ ' : role === 'teacher' ? '👨‍🏫 ' : '🎓 '}
                          {roleLabels[role]}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{portalName} Portal</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-school-cream-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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