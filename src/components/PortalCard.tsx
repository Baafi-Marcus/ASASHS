import React from 'react';

interface PortalCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const PortalCard: React.FC<PortalCardProps> = ({ 
  title, 
  children, 
  className = '',
  actions 
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-school-cream-200 overflow-hidden hover:shadow-md transition-all duration-300 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-school-cream-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};