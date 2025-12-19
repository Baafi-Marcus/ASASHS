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
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({ 
  items, 
  activeItem, 
  onItemClick 
}) => {
  return (
    <div className="w-64 bg-white border-r border-school-cream-200 h-full flex flex-col shadow-sm">
      <div className="p-4 border-b border-school-cream-200">
        <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onItemClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeItem === item.id
                    ? 'bg-school-green-100 text-school-green-700 font-medium shadow-sm'
                    : 'text-gray-700 hover:bg-school-cream-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-school-cream-200">
        <div className="text-xs text-gray-500 text-center">
          ASASHS Management System
        </div>
      </div>
    </div>
  );
};