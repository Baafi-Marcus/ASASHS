import React, { useRef, useEffect, useState } from 'react';

interface PortalButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const PortalButton: React.FC<PortalButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  type = 'button', 
  disabled = false,
  loading = false,
  loadingText,
  className = '',
  icon,
  fullWidth = false
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [lockedWidth, setLockedWidth] = useState<number | undefined>(undefined);

  // Lock button width when loading to prevent layout jump
  useEffect(() => {
    if (loading) {
      if (buttonRef.current) {
        setLockedWidth(buttonRef.current.offsetWidth);
      }
    } else {
      setLockedWidth(undefined);
    }
  }, [loading]);

  const baseClasses = "relative inline-flex items-center justify-center font-medium rounded-sm transition-all duration-fast ease-standard focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-school-green-700 min-h-[44px] select-none";
  
  const variantClasses = {
    primary: "bg-school-green-700 text-white hover:bg-school-green-800 active:bg-school-green-900 border border-school-green-800/80 hover:-translate-y-0.5",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 border border-gray-200 hover:-translate-y-0.5",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-red-700/80 hover:-translate-y-0.5",
    outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 hover:-translate-y-0.5",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-700/80 hover:-translate-y-0.5"
  };
  
  const sizeClasses = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base"
  };
  
  const disabledClasses = "opacity-50 cursor-not-allowed hover:translate-y-0 active:translate-y-0 pointer-events-none";
  const isButtonDisabled = disabled || loading;

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    isButtonDisabled ? disabledClasses : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={buttonRef}
      type={type}
      style={lockedWidth ? { width: `${lockedWidth}px` } : undefined}
      className={classes}
      onClick={onClick}
      disabled={isButtonDisabled}
      aria-busy={loading}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="truncate">{loadingText || children}</span>
        </span>
      ) : (
        <>
          {icon && <span className="mr-2 flex items-center justify-center flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};