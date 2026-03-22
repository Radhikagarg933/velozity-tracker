import React from 'react';
import { ViewType } from '../../types';
import { useApp } from '../../context/AppContext';
import { CollabUser } from '../../types';

interface HeaderProps {
  collabUsers: CollabUser[];
}

const VIEWS: { key: ViewType; label: string; icon: string }[] = [
  { key: 'kanban', label: 'Board', icon: '⊞' },
  { key: 'list', label: 'List', icon: '≡' },
  { key: 'timeline', label: 'Timeline', icon: '▬' },
];

export function Header({ collabUsers }: HeaderProps) {
  const { state, dispatch } = useApp();

  return (
    <header className="flex-shrink-0 border-b border-base-800 bg-base-950/80 backdrop-blur-md sticky top-0 z-30">
      {/* Collab presence strip */}
      <div className="flex items-center gap-3 px-6 py-2 border-b border-base-800/50">
        <div className="flex items-center gap-2">
          {collabUsers.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-base-800 border border-base-700 transition-all duration-300"
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                style={{ backgroundColor: u.color }}
              >
                {u.initials}
              </span>
              <span className="text-[10px] text-base-400 font-medium">{u.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
            </div>
          ))}
        </div>
        <span className="text-[10px] text-base-500 ml-1">
          {collabUsers.length} {collabUsers.length === 1 ? 'person' : 'people'} viewing this board
        </span>
      </div>

      {/* Main header */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold font-display">V</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-base-100 text-sm leading-none tracking-wide">
              VELOZITY TRACKER
            </h1>
            <p className="text-[10px] text-base-500 font-mono mt-0.5">
              {state.tasks.length.toLocaleString()} tasks
            </p>
          </div>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1 p-1 bg-base-800 rounded-xl border border-base-700">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: v.key })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                state.view === v.key
                  ? 'bg-base-600 text-base-100 shadow-sm'
                  : 'text-base-400 hover:text-base-200 hover:bg-base-700'
              }`}
            >
              <span className="text-[11px]">{v.icon}</span>
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
