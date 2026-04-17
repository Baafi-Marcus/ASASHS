import React from 'react';
import { PortalHeader } from './PortalHeader';
import { PortalSidebar } from './PortalSidebar';

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
  return (
    <div className="min-h-screen bg-school-cream-50 flex flex-col">
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
