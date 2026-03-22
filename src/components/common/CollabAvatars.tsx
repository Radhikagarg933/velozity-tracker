import React from 'react';
import { CollabUser } from '../../types';

interface CollabAvatarsProps {
  users: CollabUser[];
  max?: number;
  size?: 'xs' | 'sm';
}

export function CollabAvatars({ users, max = 3, size = 'xs' }: CollabAvatarsProps) {
  if (users.length === 0) return null;

  const visible = users.slice(0, max);
  const overflow = users.length - max;

  const sizeMap = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-6 h-6 text-[10px]',
  };

  return (
    <div className="flex items-center">
      {visible.map((u, i) => (
        <div
          key={u.id}
          className={`${sizeMap[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 border-2 border-base-800 transition-all duration-500`}
          style={{
            backgroundColor: u.color,
            marginLeft: i === 0 ? 0 : '-6px',
            zIndex: visible.length - i,
          }}
          title={`${u.name} is viewing`}
        >
          {u.initials}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={`${sizeMap[size]} rounded-full flex items-center justify-center font-bold text-base-300 flex-shrink-0 border-2 border-base-800 bg-base-700`}
          style={{ marginLeft: '-6px' }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
