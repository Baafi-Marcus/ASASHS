import React from 'react';

interface PortalInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  error?: string;
  className?: string;
  rows?: number;
  children?: React.ReactNode;
  as?: 'input' | 'textarea' | 'select';
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  defaultValue?: string | number;
}

export const PortalInput: React.FC<PortalInputProps> = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false,
  error,
  className = '',
  rows = 3,
  children,
  as = 'input',
  disabled = false,
  name,
  min,
  max,
  defaultValue
}) => {
  const baseClasses = "block w-full rounded-xl border-gray-300 shadow-sm focus:border-school-green-500 focus:ring-school-green-500 focus:ring-2 sm:text-sm transition-all duration-200";
  const errorClasses = error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "";
  const classes = `${baseClasses} ${errorClasses} ${className}`;
  
  const renderInput = () => {
    switch (as) {
      case 'textarea':
        return (
          <textarea
            name={name}
            rows={rows}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`${classes} py-3 px-4`}
          />
        );
      case 'select':
        return (
          <select
            name={name}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`${classes} py-3 px-4`}
          >
            {children}
          </select>
        );
      default:
        return (
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            className={`${classes} py-3 px-4`}
          />
        );
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {renderInput()}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};