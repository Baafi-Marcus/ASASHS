import React, { useState } from 'react';

interface UserAvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

// Generate deterministic background color from name string
function getDeterministicBgColor(name: string): { bg: string; text: string; border: string } {
  const palettes = [
    { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200' },
    { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
    { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
  ];

  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

// Extract first and last initials
function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  src,
  size = 'md',
  status,
  className = ''
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = getInitials(name);
  const colors = getDeterministicBgColor(name);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-bold'
  };

  // Colored presence ring wraps around the avatar rather than a detached dot
  const statusRingClasses = {
    online: 'ring-2 ring-emerald-500 ring-offset-2',
    busy: 'ring-2 ring-red-500 ring-offset-2',
    away: 'ring-2 ring-amber-500 ring-offset-2',
    offline: 'ring-1 ring-gray-300'
  };

  const ringClass = status ? statusRingClasses[status] : '';

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 rounded-full select-none overflow-hidden ${sizeClasses[size]} ${ringClass} ${className}`}
      title={name}
      aria-label={name}
    >
      {src && !imageFailed ? (
        <img
          src={src}
          alt={name}
          onError={() => setImageFailed(true)}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
        />
      ) : initials ? (
        <div className={`w-full h-full flex items-center justify-center border ${colors.bg} ${colors.text} ${colors.border} rounded-full`}>
          <span>{initials}</span>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 border border-gray-200 rounded-full">
          <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      )}
    </div>
  );
};
