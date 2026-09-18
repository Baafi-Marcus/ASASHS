import React from 'react';

interface PortalCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  onClick?: () => void;
  interactive?: boolean;
}

export const PortalCard: React.FC<PortalCardProps> = ({ 
  title, 
  children, 
  className = '',
  actions,
  onClick,
  interactive = false
}) => {
  const isClickable = interactive || !!onClick;
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-md border border-gray-200 overflow-hidden transition-all duration-fast ease-standard ${
        isClickable ? 'cursor-pointer hover:-translate-y-0.5 hover:border-gray-300' : ''
      } ${className}`}
    >
      {title && (
        <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">{title}</h2>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};