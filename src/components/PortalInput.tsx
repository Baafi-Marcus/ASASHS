import React from 'react';

interface PortalInputProps {
  id?: string;
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
  autoComplete?: string;
}

export const PortalInput: React.FC<PortalInputProps> = ({ 
  id,
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
  defaultValue,
  autoComplete
}) => {
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const baseClasses = "block w-full rounded-sm border border-gray-300 bg-white text-gray-900 text-sm transition-colors duration-fast ease-standard focus:outline-none focus:border-school-green-700 focus:ring-1 focus:ring-school-green-700 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed";
  const errorClasses = error ? "border-red-500 focus:border-red-600 focus:ring-red-600" : "";
  const classes = `${baseClasses} ${errorClasses} ${className}`;
  
  const renderInput = () => {
    switch (as) {
      case 'textarea':
        return (
          <textarea
            id={inputId}
            name={name}
            rows={rows}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`${classes} p-3`}
          />
        );
      case 'select':
        return (
          <select
            id={inputId}
            name={name}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`${classes} px-3 py-2.5 min-h-[44px]`}
          >
            {children}
          </select>
        );
      default:
        return (
          <input
            id={inputId}
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
            autoComplete={autoComplete}
            className={`${classes} px-3 py-2.5 min-h-[44px]`}
          />
        );
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
          {label} {required && <span className="text-red-500 font-normal">*</span>}
        </label>
      )}
      {renderInput()}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
};