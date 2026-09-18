import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-sm ${className}`} />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-md border border-gray-200 space-y-4 relative overflow-hidden">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-10 h-10 rounded-sm flex-shrink-0" />
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <Skeleton className="h-5 w-16 rounded-sm" />
        <Skeleton className="h-8 w-20 rounded-sm" />
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number; columns?: number }> = ({ count = 4, columns = 2 }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-5 w-full animate-fade-in`}>
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-3 w-full animate-fade-in">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white p-4 rounded-md border border-gray-200 flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-3 flex-grow">
            <Skeleton className="w-9 h-9 rounded-sm flex-shrink-0" />
            <div className="space-y-1.5 flex-grow">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-7 w-16 rounded-sm flex-shrink-0" />
        </div>
      ))}
    </div>
  );
};
