import React from 'react';

interface PortalHeaderProps {
  portalName: string;
  userName: string;
  onLogout: () => void;
  onBackToSelection?: () => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({ 
  portalName, 
  userName, 
  onLogout,
  onBackToSelection
}) => {
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
          
          <div className="flex items-center space-x-4">
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