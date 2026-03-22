import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Status, Priority, STATUSES, PRIORITIES } from '../../types';
import { USERS } from '../../data/users';

// ── Small multi-select dropdown ───────────────────────────────────────────────

interface MultiSelectProps<T extends string> {
  label: string;
  options: readonly T[];
  selected: T[];
  onChange: (vals: T[]) => void;
  renderOption?: (v: T) => React.ReactNode;
}

function MultiSelect<T extends string>({
  label,
  options,
  selected,
  onChange,
  renderOption,
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (v: T) => {
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          selected.length > 0
            ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
            : 'bg-base-800 border-base-700 text-base-400 hover:text-base-200 hover:border-base-600'
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="px-1 py-0.5 bg-blue-500/20 rounded text-[9px] font-bold text-blue-300">
            {selected.length}
          </span>
        )}
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-base-800 border border-base-700 rounded-xl shadow-2xl min-w-[140px] py-1 animate-slide-in">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-base-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="w-3 h-3 accent-blue-500 flex-shrink-0"
              />
              {renderOption ? renderOption(opt) : <span className="text-base-200">{opt}</span>}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main filter bar ───────────────────────────────────────────────────────────

export function FilterBar() {
  const { state, dispatch, hasActiveFilters } = useApp();
  const { filters } = state;

  return (
    <div className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 border-b border-base-800 bg-base-900/60 overflow-x-auto">
      {/* Status */}
      <MultiSelect<Status>
        label="Status"
        options={STATUSES}
        selected={filters.status}
        onChange={(val) => dispatch({ type: 'SET_FILTERS', payload: { status: val } })}
      />

      {/* Priority */}
      <MultiSelect<Priority>
        label="Priority"
        options={PRIORITIES}
        selected={filters.priority}
        onChange={(val) => dispatch({ type: 'SET_FILTERS', payload: { priority: val } })}
      />

      {/* Assignee */}
      <MultiSelect<string>
        label="Assignee"
        options={USERS.map((u) => u.id)}
        selected={filters.assignee}
        onChange={(val) => dispatch({ type: 'SET_FILTERS', payload: { assignee: val } })}
        renderOption={(id) => {
          const u = USERS.find((x) => x.id === id);
          return (
            <span className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                style={{ backgroundColor: u?.color }}
              >
                {u?.initials}
              </span>
              <span className="text-base-200">{u?.name}</span>
            </span>
          );
        }}
      />

      <div className="h-4 w-px bg-base-700 flex-shrink-0" />

      {/* Date range */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-base-500 font-medium flex-shrink-0">Due from</span>
        <input
          type="date"
          value={filters.dueDateFrom}
          onChange={(e) =>
            dispatch({ type: 'SET_FILTERS', payload: { dueDateFrom: e.target.value } })
          }
          className="px-2 py-1 text-xs bg-base-800 border border-base-700 rounded-lg text-base-300 focus:outline-none focus:border-base-500 w-[120px]"
        />
        <span className="text-[10px] text-base-500">to</span>
        <input
          type="date"
          value={filters.dueDateTo}
          onChange={(e) =>
            dispatch({ type: 'SET_FILTERS', payload: { dueDateTo: e.target.value } })
          }
          className="px-2 py-1 text-xs bg-base-800 border border-base-700 rounded-lg text-base-300 focus:outline-none focus:border-base-500 w-[120px]"
        />
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <>
          <div className="h-4 w-px bg-base-700 flex-shrink-0" />
          <button
            onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-colors flex-shrink-0"
          >
            <span>✕</span> Clear filters
          </button>
        </>
      )}
    </div>
  );
}
