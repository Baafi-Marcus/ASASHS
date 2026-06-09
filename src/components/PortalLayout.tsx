import React, { useContext } from 'react';
import { PortalHeader } from './PortalHeader';
import { PortalSidebar } from './PortalSidebar';
import { AuthContext } from '../../AuthContext';

interface PortalLayoutProps {
  children: React.ReactNode;
  portalName: 'Admin' | 'Teacher' | 'Student';
  userName: string;
  onLogout: () => void;
  sidebarItems: any[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  children,
  portalName,
  userName,
  onLogout,
  sidebarItems,
  activeTab,
  setActiveTab
}) => {
  const { user } = useContext(AuthContext);
  const isTestAccount = (user as any)?.is_test_account === true;

  return (
    <div className="min-h-screen bg-school-cream-50 flex flex-col">
      {isTestAccount && (
        <div className="bg-amber-500 text-white text-center text-sm font-bold py-1.5 px-4">
          TEST ACCOUNT — Actions are visible and may be reset. Do not enter real personal data.
        </div>
      )}
      <PortalHeader 
        portalName={portalName} 
        userName={userName} 
        onLogout={onLogout} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <PortalSidebar 
          items={sidebarItems} 
          activeItem={activeTab} 
          onItemClick={setActiveTab} 
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
