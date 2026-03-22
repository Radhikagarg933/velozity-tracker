import React from 'react';
import { Priority } from '../../types';

const STYLES: Record<Priority, { bg: string; text: string; dot: string }> = {
  Critical: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  High: { bg: 'bg-orange-500/15', text: 'text-orange-400', dot: 'bg-orange-400' },
  Medium: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
  Low: { bg: 'bg-green-500/15', text: 'text-green-400', dot: 'bg-green-400' },
};

interface PriorityBadgeProps {
  priority: Priority;
  compact?: boolean;
}

export function PriorityBadge({ priority, compact = false }: PriorityBadgeProps) {
  const s = STYLES[priority];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono font-medium ${s.bg} ${s.text} ${
        compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {priority}
    </span>
  );
}
