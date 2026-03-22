import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="text-4xl mb-4 opacity-60">{icon}</div>
      <h3 className="font-display font-semibold text-base-200 text-sm mb-1">{title}</h3>
      {description && (
        <p className="text-base-400 text-xs max-w-xs leading-relaxed mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 px-4 py-1.5 rounded-lg text-xs font-medium bg-base-700 hover:bg-base-600 text-base-200 transition-colors border border-base-600 hover:border-base-500"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
