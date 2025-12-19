import React from 'react';

interface PortalButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const PortalButton: React.FC<PortalButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  type = 'button', 
  disabled = false,
  className = '',
  icon
}) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-school-green-500 duration-200 transform hover:scale-[1.02]";
  
  const variantClasses = {
    primary: "bg-school-green-600 text-white hover:bg-school-green-700 shadow-md hover:shadow-lg",
    secondary: "bg-school-cream-200 text-gray-800 hover:bg-school-cream-300 shadow-sm hover:shadow-md",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg",
    outline: "border-2 border-school-green-600 text-school-green-600 hover:bg-school-green-50 shadow-sm hover:shadow-md",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  const disabledClasses = "opacity-50 cursor-not-allowed transform-none";
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled ? disabledClasses : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};