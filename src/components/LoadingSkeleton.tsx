import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'table' | 'table-row' | 'circle';
  rows?: number;
  columns?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  rows = 5,
  columns = 5,
  className = '',
}) => {
  if (variant === 'table') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="h-6 flex-1 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className={`flex gap-4 ${className}`}>
        {Array.from({ length: columns }).map((_, j) => (
          <div key={j} className="h-6 flex-1 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-school-cream-200 p-6 space-y-4 ${className}`}>
        <div className="h-5 w-1/3 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
        <div className="h-8 w-1/4 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div className={`rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse"
          style={{ width: `${70 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  );
};
