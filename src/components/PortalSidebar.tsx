import React from 'react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
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
    <aside className={`${collapsed ? 'w-14' : 'w-60'} bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-fast ease-standard select-none z-20`}>
      <div className="h-11 px-3 border-b border-gray-100 flex items-center justify-between">
        {!collapsed && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Navigation
          </span>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-sm hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors focus-visible:ring-2 focus-visible:ring-school-green-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>
      
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-3'} min-h-[38px] rounded-sm text-xs transition-colors duration-fast ease-standard focus-visible:ring-2 focus-visible:ring-school-green-700 ${
                isActive
                  ? 'bg-school-green-50 text-school-green-800 font-semibold border border-school-green-200/80'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate text-left">{item.label}</span>}
              </div>
              {!collapsed && item.badge !== undefined && (
                <span className="ml-auto text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-600 border border-gray-200">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      
      {!collapsed && (
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <div className="text-[11px] text-gray-500 font-medium text-center">
            ASASHS Portal
          </div>
        </div>
      )}
    </aside>
  );
};