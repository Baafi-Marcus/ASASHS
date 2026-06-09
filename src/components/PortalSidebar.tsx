import React from 'react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface PortalSidebarProps {
  items: SidebarItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({ 
  items, 
  activeItem, 
  onItemClick,
  collapsed,
  onToggle
}) => {
  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-school-cream-200 h-full flex flex-col shadow-sm transition-all duration-200`}>
      <div className="p-4 border-b border-school-cream-200 flex items-center justify-between">
        {!collapsed && <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-school-cream-100 text-gray-500 hover:text-gray-700 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onItemClick(item.id)}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl text-left transition-all ${
                  activeItem === item.id
                    ? 'bg-school-green-100 text-school-green-700 font-medium shadow-sm'
                    : 'text-gray-700 hover:bg-school-cream-100'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {!collapsed && (
        <div className="p-4 border-t border-school-cream-200">
          <div className="text-xs text-gray-500 text-center">
            ASASHS Management System
          </div>
        </div>
      )}
    </div>
  );
};