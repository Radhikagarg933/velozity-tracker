import React from 'react';
import { USERS } from '../../data/users';

interface AvatarProps {
  userId: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function Avatar({ userId, size = 'sm', className = '' }: AvatarProps) {
  const user = USERS.find((u) => u.id === userId);
  if (!user) return null;

  const sizeMap = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
  };

  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
      style={{ backgroundColor: user.color }}
      title={user.name}
    >
      {user.initials}
    </div>
  );
}
